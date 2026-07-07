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
 */
function getPixel(x, y) {
	return canvasContents[canvasWidth * y + x]
}

/**
 * @param x {number}
 * @param y {number}
 * @param paletteIndex {number} A uint8 that represents the pixel colour.
 */
function setPixel(x, y, paletteIndex) {
	canvasContents[canvasWidth * y + x] = paletteIndex
	imageData.data.set(
		paletteIndexToRgba(paletteIndex),
		canvasWidth * (y * 4) + x * 4,
	)
}

function existsOnCanvas(x, y) {
	return 0 <= x && x < canvasWidth && 0 <= y && y < canvasHeight
}

/**
 * @param xCenter {number}
 * @param yCenter {number}
 * @param radius {number}
 * @param drawPaletteIndex {number} The colour to draw the circle in.
 * @param replacePaletteIndex {number | undefined} If defined, only draw the circle
 *                                                 to replace pixels that are currently this colour.
 */
export function drawCircle(
	xCenter,
	yCenter,
	radius,
	drawPaletteIndex,
	replacePaletteIndex = undefined,
) {
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

				// if this pixel is within the circle's radius
				if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
					// if we are filtering to replace only specific pixel colours,
					// and this pixel is not that colour,
					// then skip it.
					if (
						replacePaletteIndex != undefined &&
						getPixel(x, y) !== replacePaletteIndex
					) {
						continue
					}

					setPixel(x, y, drawPaletteIndex)
				}
			}
		}
	}
}

/**
 * @param xStart {number}
 * @param yStart {number}
 * @param paletteIndex {number} The colour to draw floodfill with.
 *
 * Start at (x, y) on the canvas, and change the colour of that pixel
 * as well as any orthogonally connected pixels of the same colour
 * to the given palette index.
 */
export function floodFill(xStart, yStart, paletteIndex) {
	const replacePaletteIndex = getPixel(xStart, yStart)

	/** @type Array<[number, number]> */
	const stack = []

	/**
	 * @type Set<number>
	 * Each element in the set is a pixel index of the canvas.
	 * A pixel (x, y) will correspond to pixel index y*canvasWidth+x.
	 */
	const visited = new Set()

	stack.push([xStart, yStart])
	while (stack.length > 0) {
		const [xCurr, yCurr] = stack.pop()
		const curr = getPixel(xCurr, yCurr)

		if (curr === paletteIndex || curr !== replacePaletteIndex) {
			// Don't do anything to this pixel if it is already
			// the desired colour or if it isn't the colour to be
			// replaced.
			continue
		}

		setPixel(xCurr, yCurr, paletteIndex)
		visited.add(yCurr * canvasWidth + xCurr)

		const nexts = [
			[xCurr - 1, yCurr],
			[xCurr + 1, yCurr],
			[xCurr, yCurr - 1],
			[xCurr, yCurr + 1],
		]
		for (const [xNext, yNext] of nexts) {
			if (!existsOnCanvas(xNext, yNext)) {
				continue
			}
			if (visited.has(yNext * canvasWidth + xNext)) {
				continue
			}

			stack.push([xNext, yNext])
		}
	}
}
