import { clearCanvas } from "../model/canvas_state.js"

function initEvents() {
	document
		.getElementById("clear-canvas-button")
		.addEventListener("click", clearCanvas)
}

initEvents()
