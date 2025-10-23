import { createCell } from './Cell';
import { GridCell } from '../../types';
export class GridGraph {
    private cells: GridCell[][];
    private cellMap: Map<number, GridCell>;
    private rows: number;
    private cols: number;

    private startRow: number;
    private startCol: number;
    private endRow: number;
    private endCol: number;
    
    constructor(rows: number, cols: number) {
        this.cells = [];
        this.cellMap = new Map();
        this.rows = rows;
        this.cols = cols;
        this.initialize();
    }

    private initialize(): void {
        this.cells = Array.from({ length: this.rows }, (_, row) =>
            Array.from({ length: this.cols }, (_, col) => {
                const id = row * this.cols + col;
                const cell = createCell(row, col, id);
                this.cellMap.set(id, cell);
                return cell;
            })
        );
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