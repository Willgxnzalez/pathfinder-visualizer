import { createCell } from './Cell';
import { GridCell } from '../../types';
export class GridGraph {
    private cells: GridCell[][];
    private rows: number;
    private cols: number;

    private startRow: number;
    private startCol: number;
    private endRow: number;
    private endCol: number;
    
    constructor(rows: number, cols: number) {
        this.cells = [];
        this.rows = rows;
        this.cols = cols;
        this.initialize();
    }

    private initialize(): void {
        for (let row = 0; row < this.rows; ++row) {
            const currentRow: GridCell[] = new Array(this.cols);
            for (let col = 0; col < this.cols; ++col) {
                const cell = createCell(row, col);
                currentRow[col] = cell;
            }
            this.cells.push(currentRow);
        }
    }

    getDimensions(): { rows: number, cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    getCell(row: number, col: number): GridCell | undefined {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return undefined;
        }
        return this.cells[row][col];
    }

    getAllCells(): GridCell[][] {
        return this.cells;
    }

    setWalkable(row: number, col: number, wasWall: boolean): void{
        const cell = this.getCell(row, col);
        if (cell && !cell.isStart && !cell.isEnd) {
            cell.isWall = !wasWall;
        }
    }
}