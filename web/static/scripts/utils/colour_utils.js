import { MapBaseColour, MapShade } from "../enums/colour_enums.js"

/**
 * Lookup table for the RGBA values of each shade of each map colour ID.
 */
const rgbaFromBaseColourAndShadeLut = {
	0: {}, // to be populated on script load
	1: {},
	3: {},
	2: {
		0: [0, 0, 0, 0],
		1: [127, 178, 56, 255],
		2: [247, 233, 163, 255],
		3: [199, 199, 199, 255],
		4: [255, 0, 0, 255],
		5: [160, 160, 255, 255],
		6: [167, 167, 167, 255],
		7: [0, 124, 0, 255],
		8: [255, 255, 255, 255],
		9: [164, 168, 184, 255],
		10: [151, 109, 77, 255],
		11: [112, 112, 112, 255],
		12: [64, 64, 255, 255],
		13: [143, 119, 72, 255],
		14: [255, 252, 245, 255],
		15: [216, 127, 51, 255],
		16: [178, 76, 216, 255],
		17: [102, 153, 216, 255],
		18: [229, 229, 51, 255],
		19: [127, 204, 25, 255],
		20: [242, 127, 165, 255],
		21: [76, 76, 76, 255],
		22: [153, 153, 153, 255],
		23: [76, 127, 153, 255],
		24: [127, 63, 178, 255],
		25: [51, 76, 178, 255],
		26: [102, 76, 51, 255],
		27: [102, 127, 51, 255],
		28: [153, 51, 51, 255],
		29: [25, 25, 25, 255],
		30: [250, 238, 77, 255],
		31: [92, 219, 213, 255],
		32: [74, 128, 255, 255],
		33: [0, 217, 58, 255],
		34: [129, 86, 49, 255],
		35: [112, 2, 0, 255],
		36: [209, 177, 161, 255],
		37: [159, 82, 36, 255],
		38: [149, 87, 108, 255],
		39: [112, 108, 138, 255],
		40: [186, 133, 36, 255],
		41: [103, 117, 53, 255],
		42: [160, 77, 78, 255],
		43: [57, 41, 35, 255],
		44: [135, 107, 98, 255],
		45: [87, 92, 92, 255],
		46: [122, 73, 88, 255],
		47: [76, 62, 92, 255],
		48: [76, 50, 35, 255],
		49: [76, 82, 42, 255],
		50: [142, 60, 46, 255],
		51: [37, 22, 16, 255],
		52: [189, 48, 49, 255],
		53: [148, 63, 97, 255],
		54: [92, 25, 29, 255],
		55: [22, 126, 134, 255],
		56: [58, 142, 140, 255],
		57: [86, 44, 62, 255],
		58: [20, 180, 133, 255],
		59: [100, 100, 100, 255],
		60: [216, 175, 147, 255],
		61: [127, 167, 150, 255],
	},
}

/**
 * Lookup table to get the RGBA value given an 8-bit pixel value.
 * @type Object.<number, [number, number, number, number]>
 */
const rgbaFromPaletteIndexLut = {} // to be populated on script load

function populateLookupTables() {
	// The shaded RGBA values are derived using the formula described here:
	// https://minecraft.wiki/w/Map_item_format#Map_colors
	for (const colourId in rgbaFromBaseColourAndShadeLut[MapShade.BASE]) {
		const [r, g, b, a] = rgbaFromBaseColourAndShadeLut[MapShade.BASE][colourId]
		rgbaFromBaseColourAndShadeLut[MapShade.DARKENED_TWICE][colourId] = [
			Math.floor(r * 0.71),
			Math.floor(g * 0.71),
			Math.floor(b * 0.71),
			a,
		]
		rgbaFromBaseColourAndShadeLut[MapShade.DARKENED_ONCE][colourId] = [
			Math.floor(r * 0.86),
			Math.floor(g * 0.86),
			Math.floor(b * 0.86),
			a,
		]
		rgbaFromBaseColourAndShadeLut[MapShade.DARKENED_THRICE][colourId] = [
			Math.floor(r * 0.53),
			Math.floor(g * 0.53),
			Math.floor(b * 0.53),
			a,
		]

		rgbaFromPaletteIndexLut[(colourId << 2) | MapShade.DARKENED_TWICE] =
			rgbaFromBaseColourAndShadeLut[MapShade.DARKENED_TWICE][colourId]
		rgbaFromPaletteIndexLut[(colourId << 2) | MapShade.DARKENED_ONCE] =
			rgbaFromBaseColourAndShadeLut[MapShade.DARKENED_ONCE][colourId]
		rgbaFromPaletteIndexLut[(colourId << 2) | MapShade.BASE] =
			rgbaFromBaseColourAndShadeLut[MapShade.BASE][colourId]
		rgbaFromPaletteIndexLut[(colourId << 2) | MapShade.DARKENED_THRICE] =
			rgbaFromBaseColourAndShadeLut[MapShade.DARKENED_THRICE][colourId]
	}

	Object.freeze(rgbaFromBaseColourAndShadeLut)
	Object.freeze(rgbaFromPaletteIndexLut)
}
populateLookupTables()
console.log(rgbaFromPaletteIndexLut)

/**
 * from https://minecraft.wiki/w/File:Map_colors_oklab_organized.png
 *
 * excludes transparent
 */
export const MAP_COLOUR_OKLAB_SEQUENCE = [
	29, 51, 43, 48, 35, 54, 57, 47, 21, 49, 26, 34, 37, 10, 44, 11, 39, 59, 45,
	46, 53, 38, 42, 50, 28, 52, 4, 15, 40, 13, 41, 27, 7, 55, 23, 56, 61, 22, 6,
	9, 5, 17, 32, 12, 25, 24, 16, 20, 60, 36, 3, 31, 58, 1, 19, 33, 18, 30, 2, 14,
	8,
]

/**
 * The standard palette index to use for transparent.
 * (there are four palette indexes that would correspond to rgba(0,0,0,0), but we always use this one)
 */
export const PALETTE_INDEX_TRANSPARENT = 0

/**
 * Given an 8 bit palette index,
 * return the corresponding RGBA value.
 * @param {number} paletteIndex must be between 0 and 255
 */
export function paletteIndexToRgba(paletteIndex) {
	return rgbaFromPaletteIndexLut[paletteIndex]
}

/**
 * Given an 8 bit palette index,
 * return the corresponding RGBA value as a CSS string.
 * @param {number} paletteIndex must be between 0 and 255
 */
export function paletteIndexToRgbaCssString(paletteIndex) {
	const [r, g, b, a] = paletteIndexToRgba(paletteIndex)
	return `rgba(${r},${g},${b},${a})`
}

/**
 * Given a map base colour and a shade for that colour,
 * get the corresponding palette index.
 * @param {MapBaseColour} mapBaseColour
 * @param {MapShade} mapShade
 */
export function baseColourAndShadeToPaletteIndex(mapBaseColour, mapShade) {
	return (mapBaseColour << 2) | mapShade
}
