import '../styles/style.sass'
import "../styles/reset.sass"
import {canvasSize, DifficultyLevels} from "./consts.ts";
import {checkForSave, difficulties, GameInfo, handleClick, startLevel} from "./game.ts";
import {normalizeCoords} from "./utils.ts";

export let ctx:CanvasRenderingContext2D;

let canvas:HTMLCanvasElement;

let resetBtn:HTMLButtonElement;

let clickTypeSelect:HTMLSelectElement;

export let difficultySelect:HTMLSelectElement;

let applySelectBtn:HTMLButtonElement;

export let widthInput:HTMLInputElement;
export let heightInput:HTMLInputElement;
export let minesInput:HTMLInputElement;

export let minesCountLabel:HTMLLabelElement;
export let gameStateLabel:HTMLLabelElement;

window.onload = function() {
    canvas = document.getElementById("game") as HTMLCanvasElement;
    clickTypeSelect = document.getElementById("click-type") as HTMLSelectElement
    resetBtn = document.getElementById("reset-btn") as HTMLButtonElement
    difficultySelect = document.getElementById("difficulty-options") as HTMLSelectElement
    applySelectBtn = document.getElementById("apply-settings-btn") as HTMLButtonElement
    widthInput = document.getElementById("width") as HTMLInputElement
    heightInput = document.getElementById("height") as HTMLInputElement
    minesInput = document.getElementById("mines") as HTMLInputElement
    minesCountLabel = document.getElementById("mines-count") as HTMLLabelElement

    gameStateLabel = document.getElementById("game-state") as HTMLLabelElement
    gameStateLabel.addEventListener("click", function () {
        startLevel(GameInfo.difficulty)
    })

    // @ts-ignore
    ctx = canvas.getContext("2d")

    canvas.addEventListener("click", function(e) {
        const isRightClick = clickTypeSelect.value == "right"
        
        const [x, y] = normalizeCoords(e.pageX, e.pageY)
        handleClick(x, y, isRightClick);
    })

    canvas.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        const [x, y] = normalizeCoords(e.pageX, e.pageY)
        handleClick(x, y, true);
        return false;
    })

    resetBtn.addEventListener("click", function () {
        
        startLevel(GameInfo.difficulty)
    })

    difficultySelect.addEventListener("change", function (e) {
        // @ts-ignore
        const {value} = e.currentTarget
        startLevel(DifficultyLevels[value as keyof typeof DifficultyLevels])
    })

    applySelectBtn.addEventListener("click", function (e) {
        e.preventDefault()

        widthInput.value = limitNumberWithinRange(widthInput.value, 2,30);
        heightInput.value = limitNumberWithinRange(heightInput.value, 2, 30);
        minesInput.value = limitNumberWithinRange(minesInput.value, 1, Number(widthInput.value) * Number(heightInput.value) - 1);

        difficulties[DifficultyLevels.Custom].width = Number(widthInput.value)
        difficulties[DifficultyLevels.Custom].height = Number(heightInput.value)
        difficulties[DifficultyLevels.Custom].mines = Number(minesInput.value)

        startLevel(DifficultyLevels.Custom);
    })

    ctx.fillStyle = "#ddddee"
    ctx.fillRect(0 ,0, canvasSize, canvasSize)

    checkForSave()
}

function limitNumberWithinRange(num:string, min:number, max:number){
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, min), max).toString()
}