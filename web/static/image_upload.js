const form = document.querySelector("#image-upload-form")
const button = document.querySelector("#image-upload-button")
const fileInput = document.querySelector("#image-upload-file-input")

button.addEventListener("mouseup", (event) => {
	if (!fileInput.files.length) {
		alert("Please select a file to upload")
		return
	}

	const file = fileInput.files[0]
	if (!(file instanceof Blob)) {
		alert("Selected file isn't a blob?")
		return
	}

	if (file.size > MAX_UPLOAD_SIZE_BYTES) {
		alert(
			"You cannot upload a file larger than " +
				MAX_UPLOAD_SIZE_BYTES +
				" bytes in size.",
		)
		return
	}

	const formData = new FormData()
	formData.append(fileInput.getAttribute("name"), file)

	console.log(file)

	const request = new Request(form.action, {
		method: form.method,
		body: formData,
	})

	fetch(request)
		.then(async (response) => {
			if (!response.ok) {
				alert("" + response.status + ": " + (await response.text()))
				return
			}
			alert("Uploaded successfully: " + (await response.text()))
		})
		.catch((reason) => {
			alert("Failed to send request: " + reason)
			console.error(reason)
		})
})
