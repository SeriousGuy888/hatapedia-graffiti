import { MapBaseColour, MapShade } from "../enums/colour_enums.js"
import { Tool } from "../enums/tool_enums.js"
import {
	getSelectedMaskPaletteIndex,
	getSelectedPaletteIndex,
	setSelectedMaskPaletteIndex,
	setSelectedPaletteIndex,
} from "../model/colour_state.js"
import { getSelectedTool, setSelectedTool } from "../model/tool_state.js"
import {
	baseColourAndShadeToPaletteIndex,
	MAP_COLOUR_OKLAB_SEQUENCE,
	PALETTE_INDEX_TRANSPARENT,
	paletteIndexToRgbaCssString,
} from "../utils/colour_utils.js"

/**
 * @type HTTPDialogElement
 * The dialog element that opens when the user opens the colour picker.
 */
const colourPickerDialog = document.getElementById("colour-picker-dialog")

/**
 * @type HTTPButtonElement
 * The special swatch that allows the user to change their colour to transparent.
 */
const transparentSwatch = document.getElementById(
	"colour-picker-transparent-swatch",
)

/**
 * @type HTTPButtonElement
 * The button that opens the colour picker to set the primary colour.
 */
const colourPickerButton = document.getElementById("colour-picker-button")

/**
 * @type HTTPButtonElement
 * The button that opens the colour picker to set the mask colour.
 */
const maskPickerButton = document.getElementById("mask-picker-button")

/**
 * @type HTTPButtonElement
 * The button that swaps the primary and mask colours.
 */
const colourSwapButton = document.getElementById("colour-swap-button")

/** @type string.<"primary"|"mask"> */
let currentlySelectingColourFor = "primary"

/**
 * @param {number} paletteIndex A number that represents a colour
 * @param {"primary"|"mask"} whatFor Which colour selection to update
 */
function selectPaletteIndex(paletteIndex, whatFor = "primary") {
	if (whatFor === "primary") {
		setSelectedPaletteIndex(paletteIndex)

		if (getSelectedTool() == Tool.ERASER) {
			setSelectedTool(Tool.BRUSH)
		}
	} else {
		setSelectedMaskPaletteIndex(paletteIndex)
	}

	updateColourPickerButtonsWithCurrentSelectedColours()
}

/** Make sure the buttons that open the colour selector are displaying colours that are currently selected. */
function updateColourPickerButtonsWithCurrentSelectedColours() {
	let primary = getSelectedPaletteIndex()
	colourPickerButton.style.background =
		primary === PALETTE_INDEX_TRANSPARENT
			? ""
			: paletteIndexToRgbaCssString(primary)

	let mask = getSelectedMaskPaletteIndex()
	maskPickerButton.style.background =
		mask === PALETTE_INDEX_TRANSPARENT ? "" : paletteIndexToRgbaCssString(mask)
}

/**
 * @param {"primary"|"mask"} whatFor Which colour selection to update
 */
function openColourPicker(whatFor = "primary") {
	currentlySelectingColourFor = whatFor
	colourPickerDialog.showModal()

	const currPaletteIndex =
		whatFor === "primary"
			? getSelectedPaletteIndex()
			: getSelectedMaskPaletteIndex()

	// mark the appropriate swatch as active
	colourPickerDialog
		.querySelector(".colour-picker-swatch[active]")
		?.removeAttribute("active")
	colourPickerDialog
		.querySelector(
			`.colour-picker-swatch[graffiti-palette-index="${currPaletteIndex}"]`,
		)
		.setAttribute("active", "true")
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
				selectPaletteIndex(paletteIndex, currentlySelectingColourFor)
				colourPickerDialog.close()
			})
		})

		container.appendChild(clone)
	}
	transparentSwatch.addEventListener("click", (event) => {
		selectPaletteIndex(0, currentlySelectingColourFor)
		colourPickerDialog.close()
	})

	colourPickerButton.addEventListener("click", (event) => {
		openColourPicker("primary")
	})
	maskPickerButton.addEventListener("click", (event) => {
		openColourPicker("mask")
	})

	colourSwapButton.addEventListener("click", () => {
		let temp = getSelectedMaskPaletteIndex()
		setSelectedMaskPaletteIndex(getSelectedPaletteIndex())
		setSelectedPaletteIndex(temp)
		updateColourPickerButtonsWithCurrentSelectedColours()
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
	"primary",
)
selectPaletteIndex(PALETTE_INDEX_TRANSPARENT, "mask")
