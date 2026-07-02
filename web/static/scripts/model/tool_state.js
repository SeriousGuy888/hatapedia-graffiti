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
