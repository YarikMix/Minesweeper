import {DifficultyLevels, GameState, TileState} from "./consts.ts";

export interface ITile {
    chunk_id: number
    x: number
    y: number
    hasMine: boolean
    danger: number
    currentState: TileState
    revealNeighbours: () => void
    calcDanger: (grid:ITile[], chunkW:number, chunkH:number) => void
    click: (grid:ITile[], chunkW:number, chunkH:number, chunk:IChunk) => void
    flag: () => void
}

export interface IGameInfo {
    difficulty: DifficultyLevels
    state: GameState
    tileW: number
    tileH: number
    firstTry: boolean
    optimizedRender: boolean
}

export interface IDifficulty {
    name: DifficultyLevels
    width: number
    height:number
    mines: number
}

export interface IChunk {
    x: number
    y: number
    id: number
    width: number
    height: number
    grid: ITile[]
}