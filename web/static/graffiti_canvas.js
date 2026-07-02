import { colourAndShadeToPixelData, MapColour, MapShade, pixelDataToRgba } from "./colours.js"

const canvasWidth = 128
const canvasHeight = 128

/** @type HTMLCanvasElement */
const canvas = document.getElementById("graffiti-canvas")
const ctx = canvas.getContext("2d")

/**
 * An array of the pixels stored in row major order.
 * Each pixel is one uint8,
 * whose upper six bits are an index into the colour table, and
 * whose lower two bits are an index into the shade table.
 */
const pixelData = new Uint8Array(canvasWidth * canvasHeight)

/**
 * This object represents the image data drawn to the canvas.
 * It should be kept in sync with `pixelData`.
 */
const imageData = new ImageData(canvasWidth, canvasHeight)

/** Sets all pixels to be transparent. */
function clearCanvas() {
	pixelData.fill(0)
	imageData.data.fill(0)
}

/**
 * @param x {number}
 * @param y {number}
 * @param pixel {number} A uint8 that represents the pixel colour & shade.
 */
function setPixel(x, y, pixel) {
	pixelData[128 * y + x] = pixel
	imageData.data.set(pixelDataToRgba(pixel), canvasWidth * (y * 4) + x * 4)
}

/**
 * @param xCenter {number}
 * @param yCenter {number}
 * @param radius {number}
 * @param mapColour {number} An index into the map colour palette.
 * @param mapShade {number} An index into the map shade palette.
 */
function drawCircle(xCenter, yCenter, radius, mapColour, mapShade) {
    if (radius < 0) return
    
    const pixel = colourAndShadeToPixelData(mapColour, mapShade)
    console.log(pixel)

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
					setPixel(x, y, pixel)
				}
			}
		}
	}
}

function initEvents() {
	document
		.getElementById("clear-canvas-button")
		.addEventListener("mouseup", clearCanvas)
}

function initCanvas() {
	if (!ctx) {
		console.error("Cannot get 2d context for canvas.")
		return
	}

	canvas.addEventListener("mousemove", (event) => {
		if (!(event.buttons & 1)) {
			// if not leftclicking
			return
		}

		const boundingRect = canvas.getBoundingClientRect()
		const scaleX = canvas.width / boundingRect.width
		const scaleY = canvas.height / boundingRect.height
		const x = Math.floor((event.clientX - boundingRect.left) * scaleX)
		const y = Math.floor((event.clientY - boundingRect.top) * scaleY)

		drawCircle(x, y, 4, MapColour.WATER, MapShade.DARKENED_TWICE)
	})

	requestAnimationFrame(draw)
}

function draw() {
	ctx.putImageData(imageData, 0, 0)
	requestAnimationFrame(draw)
}

initEvents()
initCanvas()
