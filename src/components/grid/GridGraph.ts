import { GridNode } from '../../models/Node';
import { INode, IEdge } from '../../types';

export default class GridGraph {
    private nodes: GridNode[][];
    private nodeMap: Map<number, GridNode>;
    private rows: number;
    private cols: number;

    private startNode!: GridNode;
    private endNode!: GridNode;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        this.nodeMap = new Map();
        this.initialize();
    }

    private initialize(): void {
        this.nodes = Array.from({ length: this.rows }, (_, row) =>
            Array.from({ length: this.cols }, (_, col) => {
                const id = row * this.cols + col;
                const node = new GridNode(id, row, col);
                this.nodeMap.set(id, node);
                return node;
            })
        );
    }

    setStart(row: number, col: number): void {
        if (this.startNode) this.startNode.isStart = false;

        const node = this.getNodeAt(row, col);
        if (node) {
            node.isStart = true;
            node.walkable = true;
            this.startNode = node;
        }
    }

    setEnd(row: number, col: number): void {
        if (this.endNode) this.endNode.isEnd = false;

        const node = this.getNodeAt(row, col);
        if (node) {
            node.isEnd = true;
            node.walkable = true;
            this.endNode = node;
        }
    }

    /**
     * Clear pathfinding visualization
     * @param keepWalls - if true, keeps wall state (for reset before new run)
     */
    clearGrid(keepWalls: boolean = false): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.nodes[row][col];
                node.isVisited = false;
                node.isPath = false;
                node.parent = null;
                node.gCost = Infinity;
                node.hCost = 0;
                
                if (!keepWalls && !node.isStart && !node.isEnd) {
                    node.walkable = true;
                }
            }
        }
    }

    getDimensions() {
        return { rows: this.rows, cols: this.cols };
    }

    getNodeAt(row: number, col: number): GridNode | undefined {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return undefined;
        return this.nodes[row][col];
    }

    getAllNodes(): GridNode[][] {
        return this.nodes;
    }

    setWalkable(row: number, col: number, walkable: boolean): void {
        const node = this.getNodeAt(row, col);
        if (node && !node.isStart && !node.isEnd) {
            node.walkable = walkable;
        }
    }

    // ===== IGraph-compatible methods =====

    getNode(id: number): GridNode | undefined {
        return this.nodeMap.get(id);
    }

    getNeighbors(id: number): GridNode[] {
        const node = this.nodeMap.get(id);
        if (!node) return [];

        const { row, col } = node;
        const neighbors: GridNode[] = [];

        const addIfWalkable = (r: number, c: number) => {
            const n = this.getNodeAt(r, c);
            if (n && n.walkable) neighbors.push(n);
        };

        if (row > 0) addIfWalkable(row - 1, col);
        if (row < this.rows - 1) addIfWalkable(row + 1, col);
        if (col > 0) addIfWalkable(row, col - 1);
        if (col < this.cols - 1) addIfWalkable(row, col + 1);

        return neighbors;
    }

    getEdges(id: number): IEdge[] {
        return [];
    }

    getDistance(fromId: number, toId: number): number {
        const from = this.nodeMap.get(fromId);
        const to = this.nodeMap.get(toId);
        if (!from || !to) return Infinity;
        return Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
    }

    getHeuristic(fromId: number, toId: number): number {
        return this.getDistance(fromId, toId);
    }
    
    getStartNode(): INode {
        return this.startNode;
    }

    getEndNode(): INode {
        return this.endNode;
    }
}