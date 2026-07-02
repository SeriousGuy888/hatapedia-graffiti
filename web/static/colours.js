// data and colour names taken from
// https://minecraft.wiki/w/Map_item_format

/**
 * Given a Minecraft map colour and shade value,
 * return the corresponding 8 bit integer.
 * @param {number} mapColour must be between 0 and 63
 * @param {number} mapShade must be between 0 and 3
 */
export function colourAndShadeToPixelData(mapColour, mapShade) {
	return (mapColour << 2) | mapShade
}

/**
 * Given an 8 bit pixel data integer,
 * return the corresponding RGBA value.
 * @param {number} pixel must be between 0 and 255
 */
export function pixelDataToRgba(pixel) {
	const mapColour = (pixel & 0b11111100) >> 2
	const mapShade = pixel & 0b00000011
	return rgbaLut[mapShade][mapColour]
}

export function colourAndShadeToRgba(mapColour, mapShade) {
	return pixelDataToRgba(colourAndShadeToPixelData(mapColour, mapShade))
}

export function colourAndShadeToRgbaCssString(mapColour, mapShade) {
	const [r, g, b, a] = colourAndShadeToRgba(mapColour, mapShade)
	return `rgba(${r}, ${g}, ${b}, ${a})`
}

export const MapShade = {
	DARKENED_TWICE: 0,
	DARKENED_ONCE: 1,
	BASE: 2,
	DARKENED_THRICE: 3,
}

export const MapColour = {
	NONE: 0,
	GRASS: 1,
	SAND: 2,
	WOOL: 3,
	FIRE: 4,
	ICE: 5,
	METAL: 6,
	PLANT: 7,
	SNOW: 8,
	CLAY: 9,
	DIRT: 10,
	STONE: 11,
	WATER: 12,
	WOOD: 13,
	QUARTZ: 14,
	COLOR_ORANGE: 15,
	COLOR_MAGENTA: 16,
	COLOR_LIGHT_BLUE: 17,
	COLOR_YELLOW: 18,
	COLOR_LIGHT_GREEN: 19,
	COLOR_PINK: 20,
	COLOR_GRAY: 21,
	COLOR_LIGHT_GRAY: 22,
	COLOR_CYAN: 23,
	COLOR_PURPLE: 24,
	COLOR_BLUE: 25,
	COLOR_BROWN: 26,
	COLOR_GREEN: 27,
	COLOR_RED: 28,
	COLOR_BLACK: 29,
	GOLD: 30,
	DIAMOND: 31,
	LAPIS: 32,
	EMERALD: 33,
	PODZOL: 34,
	NETHER: 35,
	TERRACOTTA_WHITE: 36,
	TERRACOTTA_ORANGE: 37,
	TERRACOTTA_MAGENTA: 38,
	TERRACOTTA_LIGHT_BLUE: 39,
	TERRACOTTA_YELLOW: 40,
	TERRACOTTA_LIGHT_GREEN: 41,
	TERRACOTTA_PINK: 42,
	TERRACOTTA_GRAY: 43,
	TERRACOTTA_LIGHT_GRAY: 44,
	TERRACOTTA_CYAN: 45,
	TERRACOTTA_PURPLE: 46,
	TERRACOTTA_BLUE: 47,
	TERRACOTTA_BROWN: 48,
	TERRACOTTA_GREEN: 49,
	TERRACOTTA_RED: 50,
	TERRACOTTA_BLACK: 51,
	CRIMSON_NYLIUM: 52,
	CRIMSON_STEM: 53,
	CRIMSON_HYPHAE: 54,
	WARPED_NYLIUM: 55,
	WARPED_STEM: 56,
	WARPED_HYPHAE: 57,
	WARPED_WART_BLOCK: 58,
	DEEPSLATE: 59,
	RAW_IRON: 60,
	GLOW_LICHEN: 61,
	// 62 & 63 unassigned
}

// from https://minecraft.wiki/w/File:Map_colors_oklab_organized.png
// excludes transparent
export const MAP_COLOUR_OKLAB_SEQUENCE = [
	29, 51, 43, 48, 35, 54, 57, 47, 21, 49, 26, 34, 37, 10, 44, 11, 39, 59, 45,
	46, 53, 38, 42, 50, 28, 52, 4, 15, 40, 13, 41, 27, 7, 55, 23, 56, 61, 22, 6,
	9, 5, 17, 32, 12, 25, 24, 16, 20, 60, 36, 3, 31, 58, 1, 19, 33, 18, 30, 2, 14,
	8,
]

/**
 * Lookup table for the RGBA values of each shade of each map colour ID.
 */
const rgbaLut = {
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

function populateRgbaLookupTable() {
	// The shaded RGBA values are derived using the formula described here:
	// https://minecraft.wiki/w/Map_item_format#Map_colors
	for (const colourId in rgbaLut[MapShade.BASE]) {
		const [r, g, b, a] = rgbaLut[MapShade.BASE][colourId]
		rgbaLut[MapShade.DARKENED_TWICE][colourId] = [
			Math.floor(r * 0.71),
			Math.floor(g * 0.71),
			Math.floor(b * 0.71),
			a,
		]
		rgbaLut[MapShade.DARKENED_ONCE][colourId] = [
			Math.floor(r * 0.86),
			Math.floor(g * 0.86),
			Math.floor(b * 0.86),
			a,
		]
		rgbaLut[MapShade.DARKENED_THRICE][colourId] = [
			Math.floor(r * 0.53),
			Math.floor(g * 0.53),
			Math.floor(b * 0.53),
			a,
		]
	}
}
populateRgbaLookupTable()

console.log(rgbaLut)
