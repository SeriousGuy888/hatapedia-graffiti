let selectedTool = 0
export const Tool = {
	BRUSH: 0,
	ERASER: 1,
}
const toolButtons = {
	0: document.getElementById("brush-tool-button"),
	1: document.getElementById("eraser-tool-button"),
}

export function getSelectedTool() {
	return selectedTool
}
export function setSelectedTool(newTool) {
    selectedTool = newTool
    toolButtons[newTool].click()
}

for (const tool in toolButtons) {
	const toolButton = toolButtons[tool]
	toolButton.addEventListener("click", () => {
		selectThisButtonAndDeselectAllOthers(toolButton)
		selectedTool = tool
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

setSelectedTool(Tool.BRUSH)