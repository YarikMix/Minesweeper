import Tile from "./tile.ts";
import {ITile} from "./types.ts";

export class Chunk {
    id
    x
    y
    grid:ITile[]
    width
    height

    constructor(id:number, x:number, y:number, width:number, height:number) {
        this.x = x
        this.y = y
        this.id = id
        this.width = width
        this.height = height


        this.grid = []

        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                this.grid.push(new Tile(px, py) as ITile);
            }
        }
    }
}