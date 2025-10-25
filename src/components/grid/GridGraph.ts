import { GridNode } from '../../models/Node';
import { INode, IEdge } from '../../types';
import { IGraph } from '../../models/IGraph';

export default class GridGraph implements IGraph {
    private nodes: GridNode[][];
    private rows: number;
    private cols: number;

    private startNode?: GridNode;
    private endNode?: GridNode;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => new GridNode(`${r}-${c}`, r, c))
        );
    }

    setStart(row: number, col: number) {
        if (this.startNode) this.startNode.isStart = false;
        const node = this.getNodeAt(row, col);
        if (node) {
            node.isStart = true;
            node.walkable = true;
            this.startNode = node;
        }
    }

    setEnd(row: number, col: number) {
        if (this.endNode) this.endNode.isEnd = false;
        const node = this.getNodeAt(row, col);
        if (node) {
            node.isEnd = true;
            node.walkable = true;
            this.endNode = node;
        }
    }

    setWalkable(node: GridNode, walkable: boolean): void {
        if (node && !node.isStart && !node.isEnd) {
            node.walkable = walkable;
        }
    }
    getDimensions() {
        return { rows: this.rows, cols: this.cols };
    }

    getNodeAt(row: number, col: number): GridNode | undefined {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return undefined;
        return this.nodes[row][col];
    }

    getNeighbors(node: GridNode): GridNode[] {
        const { row, col } = node;
        const neighbors: GridNode[] = [];
        const tryAdd = (r: number, c: number) => {
            const n = this.getNodeAt(r, c);
            if (n && n.walkable) neighbors.push(n);
        };
        if (row > 0) tryAdd(row - 1, col);
        if (row < this.rows - 1) tryAdd(row + 1, col);
        if (col > 0) tryAdd(row, col - 1);
        if (col < this.cols - 1) tryAdd(row, col + 1);
        return neighbors;
    }

    getDistance(from: GridNode, to: GridNode): number {
        return 1;
    }

    getHeuristic(from: GridNode, to: GridNode): number {
        return Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
    }

    getStartNode(): GridNode | undefined {
        return this.startNode;
    }

    getEndNode(): GridNode | undefined {
        return this.endNode;
    }

    clearGrid(keepWalls: boolean = false) {
        for (const row of this.nodes) {
            for (const node of row) {
                node.isVisited = false;
                node.isPath = false;
                node.parent = null;
                node.gCost = Infinity;
                node.hCost = 0;
                if (!keepWalls && !node.isStart && !node.isEnd) node.walkable = true;
            }
        }
    }
}
