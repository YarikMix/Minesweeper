import {canvasSize, DifficultyLevels, GameState, TileState} from "./consts.ts";
import Tile from "./tile.ts";
import {ctx, difficultySelect, gameStateLabel, heightInput, minesCountLabel, minesInput, widthInput} from "./main.ts";
import {IDifficulty, IGameInfo, ITile} from "./types.ts";

export let grid:ITile[] = [];

export let GameInfo:IGameInfo = {
    difficulty: DifficultyLevels.Easy,
    state: GameState.Playing,
    tileW: 50,
    tileH: 50,
    firstTry: true
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
}

export function checkForSave() {
    if (localStorage.getItem("save")) {
        const data = JSON.parse(localStorage.getItem("save") as string)
        GameInfo = data.GameInfo
        grid = data.grid.map((tile:ITile) => new Tile(tile.x, tile.y, tile.hasMine, tile.danger, tile.currentState))
        difficulties = data.difficulties

        render()
    } else {
        startLevel(DifficultyLevels.Easy)
    }
}

export function startLevel(diff:DifficultyLevels) {
    GameInfo.difficulty = diff;
    GameInfo.state = GameState.Playing
    GameInfo.firstTry = true
    grid.length = 0

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

    for (let i in grid) {
        grid[i].calcDanger()
    }

    render()
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

export function render() {
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

    ctx.font = "bold 16px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    for (let i in grid) {
        let px = grid[i].x * GameInfo.tileW
        let py = grid[i].y * GameInfo.tileH
        if ((GameInfo.state == GameState.Lost || GameInfo.state == GameState.Won) && grid[i].hasMine) {
            ctx.fillStyle = "#ff0000"
            ctx.fillRect(px, py, GameInfo.tileW, GameInfo.tileH)
            ctx.fillText("💣", px + halfW, py + halfH)
        } else if (grid[i].currentState == TileState.Visible) {
            ctx.fillStyle = "#dddddd"
            ctx.fillRect(px, py, GameInfo.tileW, GameInfo.tileH)
            if (grid[i].danger) {
                ctx.fillStyle = "#000"
                ctx.fillText(grid[i].danger.toString(), px + halfW, py + halfH)
            }
        } else {
            ctx.fillStyle = "#ccc"
            ctx.fillRect(px, py, GameInfo.tileW, GameInfo.tileH)
            ctx.strokeRect(px, py, GameInfo.tileW, GameInfo.tileH)

            if (grid[i].currentState == TileState.Flagged) {
                ctx.fillText("🚩", px + halfW, py + halfH)
            }
        }
    }

    widthInput.value = cDiff.width.toString();
    heightInput.value = cDiff.height.toString();
    minesInput.value = cDiff.mines.toString();

    difficultySelect.value = DifficultyLevels[GameInfo.difficulty];

    localStorage.setItem("save", JSON.stringify({
        GameInfo: GameInfo,
        grid: grid,
        difficulties: difficulties
    }))
}
