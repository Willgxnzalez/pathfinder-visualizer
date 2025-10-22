import { Cell } from '../types'
import { GRID_ROWS, GRID_COLS, START_NODE_POS, END_NODE_POS } from './constants';

export function createGrid(): Cell[][] {
    const grid: Cell[][] = [];

    for (let row = 0; row < GRID_ROWS; ++row) {
        const currentRow: Cell[] = [];
        
        for (let col = 0; col < GRID_COLS; ++col) {
            currentRow.push({
                row,
                col,
                isWall: false,
                isStart: row === START_NODE_POS.row && col === START_NODE_POS.col,
                isEnd: row === END_NODE_POS.row && col === END_NODE_POS.col,
                isVisited: false,
                isPath: false,
                distance: Infinity,
                prevCell: null
            })
        }

        grid.push(currentRow);
    }

    return  grid; 
}

export function toggleWall(grid: Cell[][], row: number, col: number): Cell[][] {
    return grid.map((rowCells, rowIdx) => {
        if (rowIdx !== row) return rowCells;
        return rowCells.map((cell, colIdx) => {
            if (colIdx === col && !cell.isStart && !cell.isEnd) {
                return { ...cell, isWall: !cell.isWall };
            }
            return cell;
        });
    });
}