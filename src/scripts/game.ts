import {canvasSize, DifficultyLevels, GameState, TileState} from "./consts.ts";
import Tile from "./tile.ts";
import {
    ctx,
    difficultySelect,
    gameStateLabel,
    heightInput,
    minesCountLabel,
    minesInput,
    optimizedRenderToggle,
    widthInput
} from "./main.ts";
import {IDifficulty, IGameInfo, ITile} from "./types.ts";

export let grid:ITile[] = [];

export let diffs:any[] = []

export let GameInfo:IGameInfo = {
    difficulty: DifficultyLevels.Easy,
    state: GameState.Playing,
    tileW: 50,
    tileH: 50,
    firstTry: true,
    optimizedRender: false
}

export let difficulties:Record<string, IDifficulty> = {
    [DifficultyLevels.Custom]: {
        name: DifficultyLevels.Custom,
        width: 9,
        height: 9,
        mines: 10
    },
    [DifficultyLevels.Easy]: {
        name: DifficultyLevels.Easy,
        width: 9,
        height: 9,
        mines: 10
    },
    [DifficultyLevels.Medium]: {
        name: DifficultyLevels.Medium,
        width: 16,
        height: 16,
        mines: 40
    },
    [DifficultyLevels.Hard]: {
        name: DifficultyLevels.Hard,
        width: 16,
        height: 30,
        mines: 99
    }
}

export function checkState() {
    for (let i in grid) {
        if (!grid[i].hasMine && grid[i].currentState != TileState.Visible) {
            return
        }
    }

    GameInfo.state = GameState.Won
}

export function gameOver() {
    GameInfo.state = GameState.Lost

    grid.forEach(tile => {
        if (tile.hasMine && tile.currentState == TileState.Hidden) {
            diffs.push(tile)
        }
    })
}

export function checkForSave() {
    if (localStorage.getItem("save")) {
        const data = JSON.parse(localStorage.getItem("save") as string)
        GameInfo = data.GameInfo
        grid = data.grid.map((tile:ITile) => new Tile(tile.x, tile.y, tile.hasMine, tile.danger, tile.currentState))
        difficulties = data.difficulties

        render(true)
    } else {
        startLevel(DifficultyLevels.Easy)
    }
}

export function startLevel(diff:DifficultyLevels) {
    GameInfo.difficulty = diff;
    GameInfo.state = GameState.Playing
    GameInfo.firstTry = true
    grid.length = 0
    diffs = []

    let cDiff = difficulties[diff];

    GameInfo.tileW = canvasSize / cDiff.width
    GameInfo.tileH = canvasSize / cDiff.height

    for (let py = 0; py < cDiff.height; py++) {
        for (let px = 0; px < cDiff.width; px++) {
            grid.push(new Tile(px, py));
        }
    }

    let minesPlaced = 0

    while (minesPlaced < cDiff.mines) {
        let idx = Math.floor(Math.random() * grid.length);

        if (grid[idx].hasMine) {
            continue;
        }

        grid[idx].hasMine = true;
        minesPlaced++
    }

    grid.forEach(tile => {
        tile.calcDanger()
    })

    render(true)
}

export function handleClick(rawX:number, rawY:number, rightClick=false) {
    if (GameInfo.state == GameState.Won || GameInfo.state == GameState.Lost) {
        startLevel(GameInfo.difficulty)
        return
    }

    let cDiff = difficulties[GameInfo.difficulty]

    let x = Math.floor(rawX / GameInfo.tileW)
    let y = Math.floor(rawY / GameInfo.tileH)

    const idx=  x + y * cDiff.width
    const tile = grid[idx]

    if (tile.currentState != TileState.Visible && rightClick) {
        tile.flag()
        render()
    } else if (tile.currentState == TileState.Hidden) {
        tile.click()
        render()
    }
}

export function render(firstRender=false) {
    console.log("render")
    let halfW = GameInfo.tileW / 2
    let halfH = GameInfo.tileH / 2

    let cDiff = difficulties[GameInfo.difficulty]

    minesCountLabel.innerText = "💣" + cDiff.mines

    if (GameInfo.state == GameState.Lost || GameInfo.state == GameState.Won) {
        gameStateLabel.classList.add("active")
        gameStateLabel.innerText = GameInfo.state == GameState.Lost ? "Вы проиграли 😔" : "Вы победили 🥳!"
    } else {
        gameStateLabel.classList.remove("active")
        gameStateLabel.innerText = ""
    }

    ctx.font = "bold 20px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    function renderTile(tile:ITile, px:number, py:number) {
        if ((GameInfo.state == GameState.Lost || GameInfo.state == GameState.Won) && tile.hasMine) {
            ctx.fillStyle = "#dddddd"
            ctx.fillRect(px, py, GameInfo.tileW, GameInfo.tileH)
            ctx.fillText("💣", px + halfW, py + halfH)
        } else if (tile.currentState == TileState.Visible) {
            ctx.fillStyle = "#dddddd"
            ctx.fillRect(px, py, GameInfo.tileW, GameInfo.tileH)
            if (tile.danger) {
                ctx.fillStyle = "#000"
                ctx.fillText(tile.danger.toString(), px + halfW, py + halfH)
            }
        } else {
            ctx.fillStyle = "#ccc"
            ctx.fillRect(px, py, GameInfo.tileW, GameInfo.tileH)
            ctx.strokeRect(px, py, GameInfo.tileW, GameInfo.tileH)

            if (tile.currentState == TileState.Flagged) {
                ctx.fillText("🚩", px + halfW, py + halfH)
            }
        }
    }

    if (GameInfo.optimizedRender && !firstRender) {
        diffs.forEach(tile => {
            let px = tile.x * GameInfo.tileW
            let py = tile.y * GameInfo.tileH
            renderTile(tile, px, py)
        })

        console.log("Рендеров: " + diffs.length)

        diffs = []

    } else {
        grid.forEach(tile => {
            let px = tile.x * GameInfo.tileW
            let py = tile.y * GameInfo.tileH
            renderTile(tile, px, py)
        })

        console.log("Рендеров: " + grid.length)
    }

    widthInput.value = cDiff.width.toString();
    heightInput.value = cDiff.height.toString();
    minesInput.value = cDiff.mines.toString();

    difficultySelect.value = DifficultyLevels[GameInfo.difficulty];

    optimizedRenderToggle.checked = GameInfo.optimizedRender

    saveGame()
}

export function saveGame() {
    localStorage.setItem("save", JSON.stringify({
        GameInfo: GameInfo,
        grid: grid,
        difficulties: difficulties
    }))
}