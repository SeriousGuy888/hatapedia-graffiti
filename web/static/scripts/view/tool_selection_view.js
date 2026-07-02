import { Tool } from "../enums/tool_enums.js"
import { setSelectedTool } from "../model/tool_state.js"

/** @type Record<Tool, HTMLButtonElement> */
const toolButtons = {}
toolButtons[Tool.BRUSH] = document.getElementById("brush-tool-button")
toolButtons[Tool.ERASER] = document.getElementById("eraser-tool-button")
Object.freeze(toolButtons)

console.log(toolButtons)

for (const tool in toolButtons) {
	const toolButton = toolButtons[tool]
	toolButton.addEventListener("click", () => {
        selectThisButtonAndDeselectAllOthers(toolButton)
		setSelectedTool(tool)
	})
}

/** @param {HTMLButtonElement} button */
function selectThisButtonAndDeselectAllOthers(button) {
	for (const key in toolButtons) {
		const toolButton = toolButtons[key]
		if (toolButton != button) {
			toolButton.removeAttribute("active")
		}
	}
	button.setAttribute("active", "true")
}

toolButtons[Tool.BRUSH].click()