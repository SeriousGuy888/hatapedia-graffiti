import {
	colourAndShadeToPixelData,
	colourAndShadeToRgbaCssString,
	MAP_COLOUR_OKLAB_SEQUENCE,
	MapColour,
	MapShade,
	pixelDataToRgba,
} from "./colours.js"
import { getSelectedTool, setSelectedTool, Tool } from "./tools.js"

const canvasWidth = 128
const canvasHeight = 128

/** An integer. The x coordinate of the pixel of the canvas that the user's mouse is currently hovering over. -1 if not over canvas. */
let mouseX = -1

/** An integer. The y coordinate of the pixel of the canvas that the user's mouse is currently hovering over. -1 if not over canvas. */
let mouseY = -1

/**
 * A bitmask representing which mouse buttons the user is currently holding down.
 * This bitmask: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
 */
let mouseButtons = 0

/** @type HTMLCanvasElement */
const canvas = document.getElementById("graffiti-canvas")
const ctx = canvas.getContext("2d")

/** @type HTMLCanvasElement */
const overlayCanvas = document.getElementById("overlay-canvas")
const overlayCtx = overlayCanvas.getContext("2d")

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

/** @type HTTPDialogElement */
const colourPickerDialog = document.getElementById("colour-picker-dialog")

/** @type HTTPButtonElement */
const colourPickerButton = document.getElementById("colour-picker-button")

/** @type HTTPDivElement */
const selectedColourElem = document.getElementById(
	"colour-picker-dialog-selected-colour",
)
let selectedMapColour = MapColour.WATER
let selectedMapShade = MapShade.BASE

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

function selectColour(mapColour, mapShade) {
	const cssRgba = colourAndShadeToRgbaCssString(mapColour, mapShade)

	selectedColourElem.style.background = cssRgba
	colourPickerButton.style.background = cssRgba

	selectedMapColour = mapColour
	selectedMapShade = mapShade

	if (getSelectedTool() == Tool.ERASER) {
		setSelectedTool(Tool.BRUSH)
	}
}

function initEvents() {
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

	document
		.getElementById("clear-canvas-button")
		.addEventListener("click", clearCanvas)
}

function initColourPicker() {
	const container = document.getElementById("colour-picker-swatch-box")

	/** @type HTMLTemplateElement */
	const template = document.getElementById(
		"colour-picker-swatch-column-template",
	)

	for (const colourId of MAP_COLOUR_OKLAB_SEQUENCE) {
		const clone = document.importNode(template.content, true)
		const shadeSwatches = clone.querySelectorAll(".colour-picker-swatch")

		shadeSwatches[0].setAttribute("graffiti-shade-id", MapShade.DARKENED_THRICE)
		shadeSwatches[1].setAttribute("graffiti-shade-id", MapShade.DARKENED_TWICE)
		shadeSwatches[2].setAttribute("graffiti-shade-id", MapShade.DARKENED_ONCE)
		shadeSwatches[3].setAttribute("graffiti-shade-id", MapShade.BASE)
		shadeSwatches.forEach((/** @type HTMLButtonElement */ e) => {
			e.setAttribute("graffiti-colour-id", colourId)

			const shadeId = Number(e.getAttribute("graffiti-shade-id"))
			e.style.backgroundColor = colourAndShadeToRgbaCssString(colourId, shadeId)

			e.addEventListener("click", (event) => {
				selectColour(colourId, shadeId)
				colourPickerDialog.close()
			})
		})

		container.appendChild(clone)
	}

	selectColour(MapColour.WATER, MapColour.BASE)
}

function initCanvas() {
	if (!ctx || !overlayCtx) {
		console.error("Cannot get 2d context for canvas.")
		return
	}

	canvas.addEventListener("mouseleave", () => {
		mouseX = -1
		mouseY = -1
	})

	canvas.addEventListener("mousemove", (event) => {
		const boundingRect = canvas.getBoundingClientRect()
		const scaleX = canvas.width / boundingRect.width
		const scaleY = canvas.height / boundingRect.height
		mouseX = Math.floor((event.clientX - boundingRect.left) * scaleX)
		mouseY = Math.floor((event.clientY - boundingRect.top) * scaleY)

		if (!(mouseButtons & 1)) {
			// if not leftclicking
			return
		}

		useToolAt(mouseX, mouseY)
	})

	canvas.addEventListener("mousedown", (event) => {
		mouseButtons = event.buttons
		useToolAt(mouseX, mouseY)
	})

	canvas.addEventListener("mouseup", (event) => {
		mouseButtons = event.buttons
	})

	requestAnimationFrame(repaint)
}

function useToolAt(x, y) {
	const selectedTool = getSelectedTool()
	if (selectedTool == Tool.BRUSH) {
		drawCircle(x, y, 4, selectedMapColour, selectedMapShade)
	} else if (selectedTool == Tool.ERASER) {
		drawCircle(x, y, 4, MapColour.NONE, MapShade.BASE)
	}
}

function paintOverlays() {
	overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight)

	if (mouseX === -1 || mouseY === -1) {
		return
	}

	if (mouseButtons & 1 && getSelectedTool() == Tool.BRUSH) {
		return
	}

	overlayCtx.fillStyle = "black"
	overlayCtx.beginPath()
	overlayCtx.ellipse(mouseX, mouseY, 4, 4, 0, 0, Math.PI * 2)
	overlayCtx.fill()
}

function repaint() {
	ctx.putImageData(imageData, 0, 0)
	paintOverlays()
	requestAnimationFrame(repaint)
}

initEvents()
initColourPicker()
initCanvas()
