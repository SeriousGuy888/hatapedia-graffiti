import { getBrushWidth, setBrushWidth } from "../model/tool_state.js"

/** @type HTMLInputElement */
const brushWidthSlider = document.getElementById("brush-width-slider")

function initBrushWidthSlider() {
    brushWidthSlider.addEventListener("change", (event) => {
        setBrushWidth(brushWidthSlider.valueAsNumber)
    })

    brushWidthSlider.value = getBrushWidth()
}

initBrushWidthSlider()