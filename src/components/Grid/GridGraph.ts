import { createCell } from './Cell';
import { GridCell, INode } from '../../types';

export class GridGraph {
    private cells: GridCell[][];
    private cellMap: Map<number, GridCell>;
    private rows: number;
    private cols: number;

    private startCell: GridCell;
    private endCell: GridCell;
    
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
        if (this.startCell) {
            this.startCell.isStart = false;
        }

        const cell = this.getCell(row, col);
        if (cell) {
            cell.isStart = true;
            cell.isWall = false;
            this.startCell = cell;
        }
    }

    setEnd(row: number, col: number): void {
        if (this.endCell) {
            this.endCell.isEnd = false;
        }

        const cell = this.getCell(row, col);
        if (cell) {
            cell.isEnd = true;
            cell.isWall = false;
            this.endCell = cell;
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

    isWalkable(cell: GridCell): boolean {
        return !cell.isWall;
    }

    // ========== IGraph Adapter methods ==========
    private cellToNodeId(row: number, col: number): number {
        return row * this.cols + col;
    }
    
    private nodeIdToCoords(id: number): { row: number, col: number } {
        return { row: Math.floor(id / this.cols), col: id % this.cols };
    }

    private cellToNode(cell: GridCell): INode {
        return {
          id: this.cellToNodeId(cell.row, cell.col),
          walkable: !cell.isWall,
          gCost: cell.gCost,
          hCost: cell.hCost,
          parent: cell.parent ? this.cellToNode(cell) : null,
          isStart: cell.isStart,
          isEnd: cell.isEnd,
          isVisited: cell.isVisited,
          isPath: cell.isPath
        };
      }

    getNode(id: number): INode | undefined {
        const cell = this.cellMap.get(id); // O(1) lookup
        return cell ? this.cellToNode(cell) : undefined;
    }

    getNeighbors(nodeId: number): INode[] {
        const cell = this.cellMap.get(nodeId);
        if (!cell) return [];

        const row = cell.row;
        const col = cell.col;
        const neighbors: INode[] = [];

        if (row > 0) {
            const c = this.cells[row - 1][col];
            if (this.isWalkable(c)) neighbors.push(this.cellToNode(c));
        }
        if (row < this.rows - 1) {
            const c = this.cells[row + 1][col];
            if (this.isWalkable(c)) neighbors.push(this.cellToNode(c));
        }
        if (col > 0) {
            const c = this.cells[row][col - 1];
            if (this.isWalkable(c)) neighbors.push(this.cellToNode(c));
        }
        if (col < this.cols - 1) {
            const c = this.cells[row][col + 1];
            if (this.isWalkable(c)) neighbors.push(this.cellToNode(c));
        }
        return neighbors;
    }

    getStartNodeId(): number {
        return this.startCell.id;
    }

    getEndNodeId(): number {
        return this.endCell.id;
    }
}