import { MapBaseColour, MapShade } from "../enums/colour_enums.js"
import { baseColourAndShadeToPaletteIndex } from "../utils/colour_utils.js"

let selectedPaletteIndex = baseColourAndShadeToPaletteIndex(MapBaseColour.COLOR_BLACK, MapShade.BASE)
let selectedMaskPaletteIndex = 0

/** @returns {number} */
export function getSelectedPaletteIndex() {
	return selectedPaletteIndex
}

/** @param {number} newPaletteIndex */
export function setSelectedPaletteIndex(newPaletteIndex) {
    selectedPaletteIndex = newPaletteIndex
}

/** @returns {number} */
export function getSelectedMaskPaletteIndex() {
	return selectedMaskPaletteIndex
}

/** @param {number} newMaskPaletteIndex */
export function setSelectedMaskPaletteIndex(newMaskPaletteIndex) {
    selectedMaskPaletteIndex = newMaskPaletteIndex
}
