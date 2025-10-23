import { GridCell } from '../../types/index';

export function createCell(row: number, col: number, id: number): GridCell {
    return {
        id,
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