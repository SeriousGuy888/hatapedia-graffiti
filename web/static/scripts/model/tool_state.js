import { Tool } from "../enums/tool_enums.js"

/** @type Tool */
let selectedTool = Tool.BRUSH

/** @returns {Tool} */
export function getSelectedTool() {
	return selectedTool
}

/** @param {Tool} newTool */
export function setSelectedTool(newTool) {
	selectedTool = newTool
}

let brushWidth = 3
export function getBrushWidth() {
	return brushWidth
}
export function setBrushWidth(newBrushWidth) {
	if (newBrushWidth < 1) {
		console.warn("attempted to set brush width to", newBrushWidth, "???")
	}
	brushWidth = Math.round(Math.max(newBrushWidth, 1))
}
