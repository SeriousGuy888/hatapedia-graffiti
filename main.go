package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

const dbConnectionString = "graffiti.sqlite3"
const maxMemoryBytesForParsingImage int64 = 1 << 20
const maxUploadRequestSize int64 = 1 << 20
const uploadedImageLifespan = time.Hour * 24
const durationPerExpiredImageDeletion = 30 * time.Minute

type App struct {
	DB *sql.DB
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	port, ok := os.LookupEnv("PORT")
	if !ok {
		fmt.Println("Warning: environment variable PORT not specified. Using default of 5465.")
		port = "5465"
	}

	db, err := sql.Open("sqlite3", dbConnectionString)
	if err != nil {
		log.Fatal("failed to connect to database")
	}
	fmt.Println("connected to database")
	defer db.Close()

	app := App{DB: db}

	app.initDb()

	go app.periodicallyRemoveExpiredFiles()

	http.HandleFunc("GET /{$}", app.handleGetHome)
	http.HandleFunc("GET /image/{id}", app.handleGetImage)
	http.HandleFunc("POST /image/create", app.handlePostImage)

	fileServer := http.FileServer(http.Dir("./web/static"))
	http.Handle("/static/", http.StripPrefix("/static", fileServer))

	fmt.Printf("listening for http requests on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func (app App) periodicallyRemoveExpiredFiles() {
	ticker := time.NewTicker(durationPerExpiredImageDeletion)
	defer ticker.Stop()

	fmt.Printf("Starting periodic deletion task. Expired images will be found and deleted once every %s.\n",
		durationPerExpiredImageDeletion)

	for {
		t := <-ticker.C
		fmt.Printf("Periodic tick triggered at %s for deletion of expired images.\n", t.Format("2006-01-02 15:04:05"))

		result, err := app.DB.Exec("DELETE FROM images WHERE expires_at < ?", t.Unix())
		if err != nil {
			fmt.Printf("Failed to run deletion of expired images: %s\n", err.Error())
			continue
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			fmt.Printf("Error while printing number of rows affected in deletion of expired images: %s\n", err.Error())
		}

		if rowsAffected != 0 {
			fmt.Printf("Successfully deleted %d expired images from the database.\n", rowsAffected)
		}
	}
}

func (app App) handleGetHome(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("web/home.html")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	t.Execute(w, struct{ MAX_UPLOAD_SIZE_BYTES int }{int(maxUploadRequestSize)})
}

func (app App) handleGetImage(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if strings.TrimSpace(id) == "" {
		http.Error(w, "Must provide nonempty image ID.", http.StatusBadRequest)
	}
	row := app.DB.QueryRow("SELECT filename, data FROM images WHERE id = ?", id)

	filename := ""
	blob := []byte{}
	err := row.Scan(&filename, &blob)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// provide a filename for the Save As prompt to use if the user happens to use it
	// (hopefully will also convince the Images spigot plugin to display this filename in chat)
	w.Header().Add("Content-Disposition", `inline; filename*=UTF-8''`+filename)

	w.Write(blob)
}

/*
This endpoint accepts user uploaded images from POST requests encoded as multipart/form-data.
The server may reject requests if the client sends too much data.

The form can contain the following fields:
  - "uploaded-image": The binary data for an image file.
    The server may reject the upload if the given file is not an image.
  - "file-name": If this field is provided, its contents will be saved as the file name of the
    uploaded image. If not, the file name will be taken from whatever file name
    is in the uploaded-image blob's metadata.
*/
func (app App) handlePostImage(w http.ResponseWriter, r *http.Request) {
	// limit size of incoming requests
	// (turn the body into a limitreader that will eof when the max size is reached while reading)
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadRequestSize)

	// try to parse the form data (which presumably reads from r.Body)
	if err := r.ParseMultipartForm(maxMemoryBytesForParsingImage); err != nil {

		// if an error occurs while reading, check if the error was caused by the limitreader
		// this is done by checking if err is a pointer to a MaxBytesError (https://github.com/golang/go/issues/30715)
		if maxBytesErr, ok := err.(*http.MaxBytesError); ok {
			http.Error(
				w,
				fmt.Sprintf("Request body exceeded maximum allowed length of %d bytes.", maxBytesErr.Limit),
				http.StatusRequestEntityTooLarge)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer r.MultipartForm.RemoveAll()

	// Try and extract the image data from the request
	uploadedFile, uploadedFileHeader, err := r.FormFile("uploaded-image")
	if err != nil {
		// "http: no such file" is the message of ErrMissingFile, which isn't exported by Go,
		// so i have to check for a string match here
		if err.Error() == "http: no such file" {
			http.Error(w, "You must provide an image file to upload.", http.StatusBadRequest)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer uploadedFile.Close()

	// read the file into a blob
	blob, err := io.ReadAll(uploadedFile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// check if the user is uploading something that's not an image
	sniffedMimeType := http.DetectContentType(blob)
	if !strings.HasPrefix(sniffedMimeType, "image/") {
		w.Header().Add("Accept-Post", "image/*")
		http.Error(w, "The uploaded file was not an image file. You can only upload image files.",
			http.StatusUnsupportedMediaType)
		return
	}

	// decide on a file name to save this file with in the database
	fileName := uploadedFileHeader.Filename // use the one that came with the file header
	if fileNameFromFormData := r.FormValue("file-name"); len(fileNameFromFormData) > 0 {
		fileName = fileNameFromFormData
	}

	// create the created_at and expires_at timestamps
	now := time.Now()
	expiry := now.Add(uploadedImageLifespan)

	// put the image into the database
	result, err := app.DB.Exec(
		"INSERT INTO images (data, filename, created_at, expires_at) VALUES (?, ?, ?, ?)",
		blob,
		fileName,
		now.Unix(),
		expiry.Unix())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "The image can be viewed at /image/%v.\nIt will be deleted after %v, which is at %v.",
		id, uploadedImageLifespan, expiry.UTC().Format("2006-01-02 15:04 MST"))
}

func (app App) initDb() {
	content, err := os.ReadFile("migrations/001_init.sql")
	if err != nil {
		log.Fatal("Failed to read database migration file.", err)
	}

	_, err = app.DB.Exec(string(content))
	if err != nil {
		log.Fatal("Failed to execute database migration.", err)
	}

	fmt.Println("initialised database successfully")
}
