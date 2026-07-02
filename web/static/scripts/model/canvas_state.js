import { paletteIndexToRgba } from "../utils/colour_utils.js"

export const canvasWidth = 128
export const canvasHeight = 128

/**
 * An array of the pixels stored in row major order.
 * Each pixel is one uint8,
 * whose upper six bits are an index into the colour table, and
 * whose lower two bits are an index into the shade table.
 */
const canvasContents = new Uint8Array(canvasWidth * canvasHeight)

/**
 * The actual RGBA values representing the user's drawing,
 * to be drawn to the main canvas, directly accessed by the view.
 *
 * Not the actual state of the canvas, but should always
 * be in sync with the state.
 */
export const imageData = new ImageData(canvasWidth, canvasHeight)

/** Sets all pixels to be transparent. */
export function clearCanvas() {
	canvasContents.fill(0)
	imageData.data.fill(0)
}

/**
 * @param x {number}
 * @param y {number}
 * @param paletteIndex {number} A uint8 that represents the pixel colour.
 */
function setPixel(x, y, paletteIndex) {
    canvasContents[128 * y + x] = paletteIndex
    imageData.data.set(paletteIndexToRgba(paletteIndex), canvasWidth * (y * 4) + x * 4)
}

/**
 * @param xCenter {number}
 * @param yCenter {number}
 * @param radius {number}
 * @param paletteIndex {number} An integer between 0 and 255 that represents a colour.
 */
export function drawCircle(xCenter, yCenter, radius, paletteIndex) {
	if (radius < 0) return

	// loop through all pixels in a (2r+1)×(2r+1) square around (xCenter,yCenter)
	// test if that pixel is _strictly_ within a radius of r of the center
	//
	// (
	// strictly < radius (rather than <= radius)
	// for the sake of removing that one extra pixel poking out along
	// the orthogonal directions from the center on the edge that looks a bit ugly
	// )
	const radiusSquared = radius * radius
	for (let dy = -radius; dy <= radius; dy++) {
		for (let dx = -radius; dx <= radius; dx++) {
			if (dx * dx + dy * dy < radiusSquared) {
				const x = xCenter + dx
				const y = yCenter + dy
				if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
					setPixel(x, y, paletteIndex)
				}
			}
		}
	}
}
