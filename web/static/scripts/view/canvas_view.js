import { getBrushWidth, getSelectedTool } from "../model/tool_state.js"
import {
	canvasHeight,
	canvasWidth,
	drawCircle,
	floodFill,
	imageData,
} from "../model/canvas_state.js"
import { Tool } from "../enums/tool_enums.js"
import {
	getSelectedMaskPaletteIndex,
	getSelectedPaletteIndex,
} from "../model/colour_state.js"
import {
	PALETTE_INDEX_TRANSPARENT,
	paletteIndexToRgbaCssString,
} from "../utils/colour_utils.js"

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
export const canvas = document.getElementById("graffiti-canvas")
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

		if (getSelectedTool() === Tool.BUCKET) {
			return
		}

		if (mouseButtons & 1) {
			// if leftclicking

			const deltaMouseSquaredDistance = deltaMouseX ** 2 + deltaMouseY ** 2
			if (deltaMouseSquaredDistance > getBrushWidth() ** 2) {
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

		if (mouseButtons & 1) {
			useToolAt(mouseX, mouseY)
		}
	})

	canvas.addEventListener("mouseup", (event) => {
		mouseButtons = event.buttons
	})

	requestAnimationFrame(repaint)
}

function useToolAt(x, y) {
	const selectedTool = getSelectedTool()
	const brushWidth = getBrushWidth()
	switch (selectedTool) {
		case Tool.ERASER:
			drawCircle(x, y, brushWidth, PALETTE_INDEX_TRANSPARENT)
			break
		case Tool.BRUSH:
			drawCircle(x, y, brushWidth, getSelectedPaletteIndex())
			break
		case Tool.MASKED_BRUSH:
			drawCircle(
				x,
				y,
				brushWidth,
				getSelectedPaletteIndex(),
				getSelectedMaskPaletteIndex(),
			)
			break
		case Tool.BUCKET:
			console.time("floodfill")
			floodFill(x, y, getSelectedPaletteIndex())
			console.timeEnd("floodfill")
			break
		default:
			console.error(
				"Using tool",
				selectedTool,
				"with unassigned functionality.",
			)
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

	if (mouseButtons & 1 && getSelectedTool() !== Tool.ERASER) {
		return
	}

	const brushWidth = getBrushWidth() - 0.5
	overlayCtx.fillStyle =
		getSelectedTool() === Tool.ERASER
			? "black"
			: paletteIndexToRgbaCssString(getSelectedPaletteIndex())

	overlayCtx.beginPath()
	if (
		getSelectedTool() === Tool.BRUSH ||
		getSelectedTool() === Tool.MASKED_BRUSH
	) {
		overlayCtx.ellipse(
			mouseX + 0.5,
			mouseY + 0.5,
			brushWidth,
			brushWidth,
			0,
			0,
			Math.PI * 2,
		)
	} else {
		overlayCtx.rect(mouseX, mouseY, 1, 1)
	}
	overlayCtx.fill()
}

function repaint() {
	ctx.putImageData(imageData, 0, 0)
	paintOverlays()
	requestAnimationFrame(repaint)
}

initCanvas()
