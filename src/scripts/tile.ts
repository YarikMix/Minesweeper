import {grid, GameInfo, checkState, gameOver, difficulties, diffs} from "./game.ts";
import {TileState} from "./consts.ts";

let stack:Tile[] = []

class Tile {
    x
    y
    hasMine
    danger
    currentState

    constructor(x:number, y:number, hasMine=false, danger=0, currentState=TileState.Hidden) {
        this.x = x;
        this.y = y;
        this.hasMine = hasMine;
        this.danger = danger;
        this.currentState = currentState;
    }

    public calcDanger () {
        let cDiff = difficulties[GameInfo.difficulty]
        for (let py = this.y - 1; py <= this.y + 1; py++){
            for (let px = this.x - 1; px <= this.x + 1; px++) {
                if (px == this.x && py == this.y) {
                    continue;
                }

                if (px < 0 || py < 0 || px >= cDiff.width || py >= cDiff.height) {
                    continue;
                }

                if (grid[((py*cDiff.width) + px)].hasMine) {
                    this.danger++
                }
            }
        }
    }

    public flag () {
        if (this.currentState == TileState.Hidden) {
            this.currentState = TileState.Flagged
        } else if (this.currentState == TileState.Flagged) {
            this.currentState = TileState.Hidden
        }
        diffs.push(this)
    }

    public click () {
        if (this.currentState != TileState.Hidden) {
            return
        }

        if (this.hasMine && !GameInfo.firstTry) {
            gameOver()
        } else if (this.danger > 0) {
            this.currentState = TileState.Visible
            diffs.push(this)
        } else {
            this.currentState = TileState.Visible
            diffs.push(this)

            let cDiff = difficulties[GameInfo.difficulty]

            // Обработка всех соседних ячеек через стэк (рекурсивная обработка вызывает переполнение при большом количестве ячеек)

            stack.push(this)

            while (stack.length != 0) {
                const t = stack.pop() as Tile
                for (let py = t.y - 1; py <= t.y + 1; py++){
                    for (let px = t.x - 1; px <= t.x + 1; px++) {
                        if (px == t.x && py == t.y) {
                            continue;
                        }

                        if (px < 0 || py < 0 || px >= cDiff.width || py >= cDiff.height) {
                            continue;
                        }

                        let idx = ((py * cDiff.width) + px);

                        const tile = grid[idx]

                        if (tile.currentState == TileState.Hidden) {
                            tile.currentState = TileState.Visible;
                            diffs.push({x: px, y: py, hasMine: tile.hasMine, danger: tile.danger, currentState: tile.currentState})

                            if (tile.danger == 0) {
                                stack.push(tile)
                            }
                        }
                    }
                }
            }
        }

        GameInfo.firstTry = false

        checkState()
    }
}

export default Tile