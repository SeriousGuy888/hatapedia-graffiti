import { getSelectedTool } from "../model/tool_state.js"
import {
	canvasHeight,
	canvasWidth,
	drawCircle,
	imageData,
} from "../model/canvas_state.js"
import { Tool } from "../enums/tool_enums.js"
import { getSelectedPaletteIndex } from "../model/colour_state.js"

/**
 * Integer canvasspace x coordinate of the pixel that
 * the user is currently hovering over.
 */
let mouseX = -1

/**
 * Integer canvasspace y coordinate of the pixel that
 * the user is currently hovering over.
 */
let mouseY = -1

/**
 * Integer canvasspace x coordinate of the pixel that
 * the user was hovering over during the last animation frame.
 */
let mouseXPrevious = -1

/**
 * Integer canvasspace y coordinate of the pixel that
 * the user was hovering over during the last animation frame.
 */
let mouseYPrevious = -1

/**
 * A bitmask representing which mouse buttons the user is currently holding down.
 * This bitmask: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
 */
let mouseButtons = 0

/**
 * @type HTMLCanvasElement
 * The canvas that displays pixels in the image the user is drawing.
 */
const canvas = document.getElementById("graffiti-canvas")
const ctx = canvas.getContext("2d")

/**
 * @type HTMLCanvasElement
 * The canvas used for displaying interface elements like brush size previews
 * that are not part of the image that the user is drawing.
 */
const overlayCanvas = document.getElementById("overlay-canvas")
const overlayCtx = overlayCanvas.getContext("2d")

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
		mouseButtons = event.buttons

		const deltaMouseX = mouseX - mouseXPrevious
		const deltaMouseY = mouseY - mouseYPrevious
		mouseXPrevious = mouseX
		mouseYPrevious = mouseY

		if (mouseButtons & 1) {
			// if leftclicking

			const deltaMouseSquaredDistance = deltaMouseX ** 2 + deltaMouseY ** 2
			if (deltaMouseSquaredDistance > 5 * 5) {
				const numInterpolatedUses = Math.sqrt(deltaMouseSquaredDistance)

				interpolateToolUsage(
					mouseX - deltaMouseX,
					mouseY - deltaMouseY,
					mouseX,
					mouseY,
					numInterpolatedUses,
				)
			}
			useToolAt(mouseX, mouseY)
		}
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
		drawCircle(x, y, 4, getSelectedPaletteIndex())
	} else if (selectedTool == Tool.ERASER) {
		drawCircle(x, y, 4, 0)
	}
}

function interpolateToolUsage(startX, startY, endX, endY, howManySteps) {
	let stepSizeX = (endX - startX) / howManySteps
	let stepSizeY = (endY - startY) / howManySteps

	if (stepSizeX === 0 && stepSizeY === 0) return

	for (
		let x = startX, y = startY;
		x <= Math.max(startX, endX) &&
		x >= Math.min(startX, endX) &&
		y <= Math.max(startY, endY) &&
		y >= Math.min(startY, endY);
		x += stepSizeX, y += stepSizeY
	) {
		useToolAt(Math.round(x), Math.round(y))
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

initCanvas()
