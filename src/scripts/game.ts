import {DifficultyLevels, GameState, TileState} from "./consts.ts";
import Tile from "./tile.ts";
import {
    difficultySelect,
    gameStateLabel,
    heightInput,
    minesCountLabel,
    minesInput,
    optimizedRenderToggle,
    viewport,
    widthInput
} from "./main.ts";
import {IChunk, IDifficulty, IGameInfo, ITile} from "./types.ts";
import {Chunk} from "./chunk.ts";

export let diffs:any[] = []

export let chunks:IChunk[] = []

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
        width: 1000,
        height: 1000,
        mines: 100000
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

    let flag = true
    chunks.forEach(chunk => {
        for (let i in chunk.grid) {
            if (!chunk.grid[i].hasMine && chunk.grid[i].currentState != TileState.Visible) {
                flag = false
                return
            }
        }
    })

    if (flag) {
        console.log("Won")
        GameInfo.state = GameState.Won

        chunks.forEach(chunk => {
            chunk.grid.forEach(tile => {
                if (tile.hasMine && tile.currentState == TileState.Hidden) {
                    diffs.push(tile)
                }
            })
        })
    }
}

export function gameOver() {
    console.log("gameOver")

    GameInfo.state = GameState.Lost

    chunks.forEach(chunk => {
        chunk.grid.forEach(tile => {
            if (tile.hasMine && tile.currentState == TileState.Hidden) {
                diffs.push(tile)
            }
        })
    })
}

export function checkForSave() {
    if (localStorage.getItem("save")) {
        const data = JSON.parse(localStorage.getItem("save") as string)
        GameInfo = data.GameInfo
        grid = data.grid.map((tile:ITile) => new Tile(tile.x, tile.y, tile.hasMine, tile.danger, tile.currentState))
        difficulties = data.difficulties

        // calcSizes()

        // render(true)
    } else {
        startLevel(DifficultyLevels.Easy)
    }
}

export function startLevel(difficulty:DifficultyLevels) {
    GameInfo.difficulty = difficulty;
    GameInfo.state = GameState.Playing
    GameInfo.firstTry = true
    diffs = []
    chunks = []

    let cDiff = difficulties[difficulty];

    let k = 1
    for(let i = 0; i < Math.ceil(cDiff.width / 100); i++){
        for (let j = 0; j < Math.ceil(cDiff.height / 100); j++) {
            chunks.push(new Chunk(k, i, j, Math.min(cDiff.width - i * 100, 100), Math.min(cDiff.height - j * 100, 100)))
            k += 1
        }
    }

    console.log(chunks)

    chunks.forEach(chunk => {

        const canvas = document.createElement("canvas")
        canvas.id = chunk.id.toString()
        canvas.style.left = (chunk.x * (100 * 50)).toString() + "px"
        canvas.style.top = (chunk.y * (100 * 50)).toString() + "px"

        console.log(chunk.width)
        canvas.width = chunk.width * 50
        canvas.height = chunk.height * 50

        viewport.appendChild(canvas)

        renderChunk(chunk, true)
    })
}

function placeMines(excludeIdx:number | null=null) {
    console.log("placeMines")

    let cDiff = difficulties[GameInfo.difficulty];

    let minesPlaced = 0


    while (minesPlaced < cDiff.mines) {
        const chunk = chunks[Math.floor(Math.random() * chunks.length)]
        let idx = Math.floor(Math.random() * chunk.grid.length);

        if (chunk.grid[idx].hasMine || excludeIdx == idx) {
            continue;
        }

        chunk.grid[idx].hasMine = true;
        minesPlaced++
    }

    chunks.forEach(chunk => {
        // TODO: как вычислять на границе чанков
        chunk.grid.forEach(tile => {
            tile.calcDanger(chunk.grid, chunk.width, chunk.height)
        })
    })
}

export function handleClick(rawX:number, rawY:number, chunk_id:string, rightClick=false) {
    if (GameInfo.state == GameState.Won || GameInfo.state == GameState.Lost) {
        startLevel(GameInfo.difficulty)
        return
    }

    const chunk = chunks[Number(chunk_id) - 1] as IChunk
    console.log(chunk)

    let x = Math.floor(rawX / GameInfo.tileW)
    let y = Math.floor(rawY / GameInfo.tileH)

    const idx=  x + y * chunk.width

    const tile = chunk.grid[idx]
    console.log(tile)

    if (GameInfo.firstTry) {
        placeMines(idx)
        GameInfo.firstTry = false
    }

    if (tile.currentState != TileState.Visible && rightClick) {
        tile.flag()
        renderChunk(chunk)
    } else if (tile.currentState == TileState.Hidden) {
        tile.click(chunk.grid, chunk.width, chunk.height, chunk)

        if (GameInfo.state == GameState.Playing) {
            chunks.forEach(chunk => {
                renderChunk(chunk, true)
            })
        }
    }
}

export function handleTileClick(chunkX, chunkY, tileX, tileY) {
    console.log("handleTileClick")

    const chunk = chunks.find(c => c.x == chunkX && c.y == chunkY)
    console.log(chunkX, chunkY, tileX, tileY)

    if (!chunk) {
        return
    }

    const idx =  tileX + tileY * chunk.width

    const tile = chunk.grid[idx]
    tile.click(chunk.grid, chunk.width, chunk.height, chunk)
}

export function renderChunk(chunk:IChunk, forceRender=false) {
    console.log("renderChunk")
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

    const canvas = document.getElementById(chunk.id.toString()) as HTMLCanvasElement
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

    ctx.font = "bold 10px monospace"
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

            ctx.fillStyle = "#000"
            ctx.fillText(`${px},${py}`, px + halfW, py + halfH)

            if (tile.currentState == TileState.Flagged) {
                ctx.fillText("🚩", px + halfW, py + halfH)
            }
        }
    }

    if (GameInfo.optimizedRender && !forceRender) {
        diffs.forEach(tile => {
            let px = tile.x * GameInfo.tileW
            let py = tile.y * GameInfo.tileH
            renderTile(tile, px, py)
        })

        console.log("Рендеров: " + diffs.length)

        diffs = []

    } else {

        chunk.grid.forEach(tile => {
            let px = tile.x * GameInfo.tileW
            let py = tile.y * GameInfo.tileH
            renderTile(tile, px, py)
        })

        console.log("Рендеров: " + chunk.grid.length)
    }

    widthInput.value = cDiff.width.toString();
    heightInput.value = cDiff.height.toString();
    minesInput.value = cDiff.mines.toString();

    difficultySelect.value = DifficultyLevels[GameInfo.difficulty];

    optimizedRenderToggle.checked = GameInfo.optimizedRender

    // saveGame()
}

export function saveGame() {
    try {
        localStorage.setItem("save", JSON.stringify({
            GameInfo: GameInfo,
            grid: grid,
            difficulties: difficulties
        }))
    } catch {
        console.log("Не удалось сохранить игру")
    }
}