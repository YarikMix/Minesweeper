import {DifficultyLevels, GameState, TileState} from "./consts.ts";

export interface ITile {
    x: number
    y: number
    hasMine: boolean
    danger: number
    currentState: TileState
    revealNeighbours: () => void
    calcDanger: () => void
    click: () => void
    flag: () => void
}

export interface IGameInfo {
    difficulty: DifficultyLevels
    state: GameState
    tileW: number
    tileH: number
    firstTry: boolean
}

export interface IDifficulty {
    name: DifficultyLevels
    width: number
    height:number
    mines: number
}

export interface IMouseState {
    x: number,
    y: number,
    click: [number, number, number] | null
}