import { clearCanvas } from "../model/canvas_state.js"
import { canvas } from "./canvas_view.js"

function initEvents() {
	document
		.getElementById("clear-canvas-button")
		.addEventListener("click", clearCanvas)

	document
		.getElementById("upload-canvas-button")
		.addEventListener("click", upload)
}

function upload() {
	canvas.toBlob((blob) => {
		if (!blob) {
			alert("Failed to convert canvas contents into image data. :(((")
			return
		}

		const formData = new FormData()
		formData.append("uploaded-image", blob)
		formData.append("file-name", `drawing-${new Date().toISOString()}.png`)

		const request = new Request("/image/create", {
			method: "POST",
			body: formData,
		})

		fetch(request)
			.then(async (response) => {
				if (!response.ok) {
					alert("" + response.status + ": " + (await response.text()))
					return
				}

				const { message, url } = await response.json()
				if (
					confirm(
						"Uploaded successfully. " +
							message +
							"\n\nDo you want to open this URL in a new tab?",
					)
				) {
					open(url, "_blank")
				}
			})
			.catch((reason) => {
				alert("Failed to upload: " + reason)
				console.error(reason)
			})
	}, "image/png")
}

initEvents()
