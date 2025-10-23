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

    setStart(row: number, col: number): void {
        if (this.startRow != null && this.startRow >= 0) {
            this.cells[this.startRow][this.startCol].isStart = false;
        }

        const cell = this.getCell(row, col);
        if (cell) {
            cell.isStart = true;
            cell.isWall = false;
            this.startRow = row;
            this.startCol = col;
        }
    }

    setEnd(row: number, col: number): void {
        if (this.endRow != null && this.endRow >= 0) {
            this.cells[this.endRow][this.endCol].isEnd = false;
        }

        const cell = this.getCell(row, col);
        if (cell) {
            cell.isEnd = true;
            cell.isWall = false;
            this.endRow = row;
            this.endCol = col;
        }
    }

    getDimensions(): { rows: number, cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    getCell(row: number, col: number): GridCell | null {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
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