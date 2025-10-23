import { GridCell } from '../../types/index';

export function createCell(row: number, col: number): GridCell {
    return {
        row,
        col,
        isWall: false,
        isStart: false,
        isEnd: false,
        isVisited: false,
        isPath: false,
        gCost: Infinity,
        hCost: 0,
        parent: null
    }
}