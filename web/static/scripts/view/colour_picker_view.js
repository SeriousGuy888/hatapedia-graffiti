import { MapBaseColour, MapShade } from "../enums/colour_enums.js"
import { Tool } from "../enums/tool_enums.js"
import { setSelectedPaletteIndex } from "../model/colour_state.js"
import { getSelectedTool, setSelectedTool } from "../model/tool_state.js"
import {
	baseColourAndShadeToPaletteIndex,
	MAP_COLOUR_OKLAB_SEQUENCE,
	paletteIndexToRgbaCssString,
} from "../utils/colour_utils.js"

/**
 * @type HTTPDialogElement
 * The dialog element that opens when the user opens the colour picker.
 */
const colourPickerDialog = document.getElementById("colour-picker-dialog")

/**
 * @type HTTPDivElement
 * The preview inside the colour picker dialog that displays the user's
 * currently selected colour.
 */
const selectedColourElem = document.getElementById(
	"colour-picker-dialog-selected-colour",
)

/**
 * @type HTTPButtonElement
 * The button that opens the colour picker.
 */
const colourPickerButton = document.getElementById("colour-picker-button")

function selectPaletteIndex(paletteIndex) {
	setSelectedPaletteIndex(paletteIndex)

	const cssRgba = paletteIndexToRgbaCssString(paletteIndex)
	selectedColourElem.style.background = cssRgba
	colourPickerButton.style.background = cssRgba

	// mark the selected swatch as active
	colourPickerDialog
		.querySelector(".colour-picker-swatch[active]")
		?.removeAttribute("active")
	colourPickerDialog
		.querySelector(
			`.colour-picker-swatch[graffiti-palette-index="${paletteIndex}"]`,
		)
		.setAttribute("active", "true")

	if (getSelectedTool() == Tool.ERASER) {
		setSelectedTool(Tool.BRUSH)
	}
}

function initColourPicker() {
	const container = document.getElementById("colour-picker-swatch-box")

	/** @type HTMLTemplateElement */
	const template = document.getElementById(
		"colour-picker-swatch-column-template",
	)

	for (const baseColourId of MAP_COLOUR_OKLAB_SEQUENCE) {
		const clone = document.importNode(template.content, true)
		const shadeSwatches = clone.querySelectorAll(".colour-picker-swatch")

		shadeSwatches[0].setAttribute(
			"graffiti-palette-index",
			baseColourAndShadeToPaletteIndex(baseColourId, MapShade.DARKENED_THRICE),
		)
		shadeSwatches[1].setAttribute(
			"graffiti-palette-index",
			baseColourAndShadeToPaletteIndex(baseColourId, MapShade.DARKENED_TWICE),
		)
		shadeSwatches[2].setAttribute(
			"graffiti-palette-index",
			baseColourAndShadeToPaletteIndex(baseColourId, MapShade.DARKENED_ONCE),
		)
		shadeSwatches[3].setAttribute(
			"graffiti-palette-index",
			baseColourAndShadeToPaletteIndex(baseColourId, MapShade.BASE),
		)
		shadeSwatches.forEach((/** @type HTMLButtonElement */ e) => {
			const paletteIndex = Number(e.getAttribute("graffiti-palette-index"))
			e.style.backgroundColor = paletteIndexToRgbaCssString(paletteIndex)

			e.addEventListener("click", (event) => {
				selectPaletteIndex(paletteIndex)
				colourPickerDialog.close()
			})
		})

		container.appendChild(clone)
	}

	colourPickerButton.addEventListener("click", (event) => {
		colourPickerDialog.showModal()
	})
	colourPickerDialog.addEventListener("click", (event) => {
		// close dialog if backdrop clicked
		const rect = colourPickerDialog.getBoundingClientRect()
		const isInDialog =
			rect.top <= event.clientY &&
			event.clientY <= rect.top + rect.height &&
			rect.left <= event.clientX &&
			event.clientX <= rect.left + rect.width
		if (!isInDialog) {
			colourPickerDialog.close()
		}
	})
}

initColourPicker()
selectPaletteIndex(
	baseColourAndShadeToPaletteIndex(MapBaseColour.WATER, MapShade.BASE),
)
