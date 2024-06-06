import '../styles/style.sass'
import "../styles/reset.sass"
import {DifficultyLevels} from "./consts.ts";
import {checkForSave, difficulties, GameInfo, handleClick, saveGame, startLevel} from "./game.ts";
import {normalizeCoords} from "./utils.ts";

export let ctx:CanvasRenderingContext2D;

export let canvas:HTMLCanvasElement;

let resetBtn:HTMLButtonElement;

let clickTypeSelect:HTMLSelectElement;

export let difficultySelect:HTMLSelectElement;

let applySelectBtn:HTMLButtonElement;

export let widthInput:HTMLInputElement;
export let heightInput:HTMLInputElement;
export let minesInput:HTMLInputElement;

export let minesCountLabel:HTMLLabelElement;
export let gameStateLabel:HTMLLabelElement;

export let optimizedRenderToggle:HTMLInputElement;

let darkmodeToggle:HTMLElement;

let darkmodeToggleIcon:HTMLElement;

function store(value:any) {
    localStorage.setItem("darkmode", value)
}

function load() {
    const darkmode = localStorage.getItem("darkmode")

    darkmodeToggleIcon = document.querySelector(".darkmode-toggle__icon") as HTMLElement;

    if (!darkmode) {
        store(false)
    } else if (darkmode == "true") {
        document.body.classList.add("darkmode")
        darkmodeToggleIcon.classList.remove("fa-sun")
        darkmodeToggleIcon.classList.add("fa-moon")
    }
}

window.onload = function() {
    load()

    clickTypeSelect = document.getElementById("click-type") as HTMLSelectElement

    resetBtn = document.getElementById("reset-btn") as HTMLButtonElement
    resetBtn.addEventListener("click", function () {
        startLevel(GameInfo.difficulty)
    })

    difficultySelect = document.getElementById("difficulty-options") as HTMLSelectElement
    difficultySelect.addEventListener("change", function (e) {
        // @ts-ignore
        const {value} = e.currentTarget
        startLevel(DifficultyLevels[value as keyof typeof DifficultyLevels])
    })

    applySelectBtn = document.getElementById("apply-settings-btn") as HTMLButtonElement
    applySelectBtn.addEventListener("click", function (e) {
        e.preventDefault()

        widthInput.value = limitNumberWithinRange(widthInput.value, 2, 1000);
        heightInput.value = limitNumberWithinRange(heightInput.value, 2, 1000);
        minesInput.value = limitNumberWithinRange(minesInput.value, 1, Number(widthInput.value) * Number(heightInput.value) - 1);

        difficulties[DifficultyLevels.Custom].width = Number(widthInput.value)
        difficulties[DifficultyLevels.Custom].height = Number(heightInput.value)
        difficulties[DifficultyLevels.Custom].mines = Number(minesInput.value)

        startLevel(DifficultyLevels.Custom);
    })

    darkmodeToggle = document.querySelector(".darkmode-toggle") as HTMLElement;
    darkmodeToggleIcon = document.querySelector(".darkmode-toggle__icon") as HTMLElement;
    darkmodeToggle.addEventListener("click", function () {
        document.body.classList.toggle("darkmode")

        store(document.body.classList.contains("darkmode"))

        if (document.body.classList.contains("darkmode")) {
            darkmodeToggleIcon.classList.remove("fa-sun")
            darkmodeToggleIcon.classList.add("fa-moon")
        } else {
            darkmodeToggleIcon.classList.remove("fa-moon")
            darkmodeToggleIcon.classList.add("fa-sun")
        }
    })

    widthInput = document.getElementById("width") as HTMLInputElement
    heightInput = document.getElementById("height") as HTMLInputElement
    minesInput = document.getElementById("mines") as HTMLInputElement
    minesCountLabel = document.getElementById("mines-count") as HTMLLabelElement

    optimizedRenderToggle = document.getElementById("optimized-render-toggle") as HTMLInputElement
    optimizedRenderToggle.addEventListener("change", function (e) {
        const {checked} = e.target as HTMLInputElement
        console.log(checked)
        GameInfo.optimizedRender = checked
        saveGame()
    })

    gameStateLabel = document.getElementById("game-state") as HTMLLabelElement
    gameStateLabel.addEventListener("click", function () {
        startLevel(GameInfo.difficulty)
    })

    canvas = document.getElementById("game") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D

    canvas.addEventListener("click", function(e) {
        const isRightClick = clickTypeSelect.value == "right"

        const [x, y] = normalizeCoords(e.pageX, e.pageY)
        handleClick(x, y, isRightClick);
    })

    canvas.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        const [x, y] = normalizeCoords(e.pageX, e.pageY)
        handleClick(x , y,true);
        return false;
    })

    checkForSave()
}

function limitNumberWithinRange(num:string, min:number, max:number){
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, min), max).toString()
}