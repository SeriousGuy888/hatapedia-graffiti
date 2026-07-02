import { MapBaseColour, MapShade } from "../enums/colour_enums.js"
import { baseColourAndShadeToPaletteIndex } from "../utils/colour_utils.js"

let selectedPaletteIndex = baseColourAndShadeToPaletteIndex(MapBaseColour.COLOR_BLACK, MapShade.BASE)

/** @returns {number} */
export function getSelectedPaletteIndex() {
	return selectedPaletteIndex
}

/** @param {number} newPaletteIndex */
export function setSelectedPaletteIndex(newPaletteIndex) {
    selectedPaletteIndex = newPaletteIndex
}
