import {grid, GameInfo, checkState, gameOver, difficulties} from "./game.ts";
import {TileState} from "./consts.ts";

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
    }

    public click () {
        
        if (this.currentState != TileState.Hidden) {
            return
        }

        if (this.hasMine && !GameInfo.firstTry) {
            gameOver()
        } else if (this.danger > 0) {
            this.currentState = TileState.Visible
        } else {
            this.currentState = TileState.Visible
            this.revealNeighbours()
        }

        GameInfo.firstTry = false

        checkState()
    }

    public revealNeighbours () {
        let cDiff = difficulties[GameInfo.difficulty]

        for (let py = this.y - 1; py <= this.y + 1; py++){
            for (let px = this.x - 1; px <= this.x + 1; px++) {
                if (px == this.x && py == this.y) {
                    continue;
                }

                if (px < 0 || py < 0 || px >= cDiff.width || py >= cDiff.height) {
                    continue;
                }

                let idx = ((py * cDiff.width) + px);

                if (grid[idx].currentState == TileState.Hidden) {
                    grid[idx].currentState = TileState.Visible;

                    if (grid[idx].danger == 0) {
                        grid[idx].revealNeighbours();
                    }
                }
            }
        }
    }
}

export default Tile