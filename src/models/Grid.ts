import { IGraph, INode, isGridNode } from "../types";
import { GridNode } from "./Node";

export default class GridGraph implements IGraph {
    private grid: GridNode[][] = [];
    private rows: number = 0;
    private cols: number = 0;
    private startNode: GridNode | null = null;
    private endNode: GridNode | null = null;

    constructor(rows: number, cols: number) {
        this.createGrid(rows, cols);
    }

    createGrid(rows: number, cols: number): void {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];

        for (let row = 0; row < this.rows; ++row) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; ++col) {
                const id = `${row}-${col}`;
                this.grid[row][col] = new GridNode(id, row, col);
            }
        }
    }

    getNode(row: number, col: number): GridNode | null {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    getNodeById(id: string) {
        const [rowStr, colStr] = id.split("-");
        const row = Number(rowStr);
        const col = Number(colStr);
        if (isNaN(row) || isNaN(col)) return null;
        return this.getNode(row, col);
    }

    getDimensions() {
        return { rows: this.rows, cols: this.cols };
    }

    // IGraph
    getStartNode(): INode | null { return this.startNode; }

    getEndNode(): INode | null { return this.endNode; }

    getNeighbors(node: INode): INode[] {
        if (!isGridNode(node)) return [];
        const dirs = [
            [-1, 0], // up
            [1, 0],  // down
            [0, -1], // left
            [0, 1],  // right
        ];
        return dirs
            .map(([dr, dc]) => this.getNode((node as any).row + dr, (node as any).col + dc))
            .filter((n): n is GridNode => !!n && n.isWalkable);
    }

    getDistance(from: INode, to: INode): number {
        return 1;
    }

    getHeuristic(from: INode, to: INode): number {
        if (isGridNode(from) && isGridNode(to)) {
            return Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
        }
        return 0;
    }

    setStartNode(row: number, col: number): void {
        const node = this.getNode(row, col);
        if (!node) return;
        if (this.startNode) {
            this.startNode.isStart = false;
            this.resetNodeState(this.startNode);
        }
        this.startNode = node;
        node.isStart = true;
        node.isWalkable = true;
    }

    setEndNode(row: number, col: number): void {
        const node = this.getNode(row, col);
        if (!node) return;
        if (this.endNode) {
            this.endNode.isEnd = false;
            this.resetNodeState(this.endNode);
        }
        this.endNode = node;
        node.isEnd = true;
        node.isWalkable = true;
    }

    setNodeWalkable(node: INode, walkable: boolean): void {
        if (node.isStart || node.isEnd) return;
        node.isWalkable = walkable;
    }

    resetNodeState(node: GridNode): void {
        node.isVisited = false;
        node.isFrontier = false;
        node.isPath = false;
        node.gCost = Infinity;
        node.hCost = 0;
        node.parent = null;
    }

    resetGrid(clearWalls: boolean = false): void {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const node = this.grid[r][c];
                this.resetNodeState(node);
                if (clearWalls && !node.isStart && !node.isEnd) {
                    node.isWalkable = true;
                }
            }
        }
    }

    // For UI: iterate all nodes
    *nodes(): Generator<GridNode> {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                yield this.grid[r][c];
            }
        }
    }
}