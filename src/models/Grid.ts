// models/Grid.ts

import { GridNode } from "./Node";
import { IGraph } from "../types";
import { INode } from "../types";
import { STATE_STYLES } from "../utils/constants";

const CELL_BASE = "border border-gray-700 transition-colors duration-150 -mt-px -ml-px box-border";

export default class Grid implements IGraph {
    // Grid structure
    private grid: GridNode[][];
    private rows: number;
    private cols: number;
    private cellSize: number = 0;

    // Start and end nodes
    private startNode: GridNode | null = null;
    private endNode: GridNode | null = null;

    // DOM/UI references
    private container: HTMLElement | null = null;
    private cellElements: Map<string, HTMLElement>;

    // Input handling
    private drawMode: 'wall' | 'erase' = 'wall';
    private isDrawing: boolean = false;
    private draggedNode: INode | null = null;
    private isDraggingStartOrEnd: boolean = false;

    constructor(rows: number, cols: number, cellSize: number, container: HTMLElement) {
        this.grid = [];
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;

        this.container = container;

        this.cellElements = new Map();

        this.initialize();
        this.render();
    }

    private initialize(): void {
        for (let row = 0; row < this.rows; ++row) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; ++col) {
                const id = `${row}-${col}`;
                this.grid[row][col] = new GridNode(id, row, col);
            }
        }
        this.setStart(0, 0);
        this.setEnd(this.rows - 1, this.cols - 1);
    }

    // ============ IGraph Implementation ============

    getStartNode(): INode | null {
        return this.startNode;
    }

    getEndNode(): INode | null {
        return this.endNode;
    }

    getNodeAt(row: number, col: number): INode | null {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    getDimensions(): { rows: number; cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    getNeighbors(node: INode): INode[] {
        const neighbors: INode[] = [];
        if (!(node instanceof GridNode)) return neighbors;

        const directions = [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 },
        ];

        for (const { row, col } of directions) {
            const newRow = node.row + row;
            const newCol = node.col + col;
            const neighbor = this.getNodeAt(newRow, newCol);
            if (neighbor && neighbor.walkable) {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }

    getDistance(from: GridNode, to: GridNode): number {
        return 1;
    }

    getHeuristic(from: GridNode, to: GridNode): number {
        return Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
    }

    setStart(row: number, col: number): void {
        const node = this.getNodeAt(row, col);
        if (!node) return;

        if (this.startNode) {
            this.startNode.isStart = false;
            this.updateNodeUI(this.startNode);
        }

        this.startNode = node as GridNode;
        node.isStart = true;
        node.walkable = true;
        this.updateNodeUI(node);
    }

    setEnd(row: number, col: number): void {
        const node = this.getNodeAt(row, col);
        if (!node) return;

        if (this.endNode) {
            this.endNode.isEnd = false;
            this.updateNodeUI(this.endNode);
        }

        this.endNode = node as GridNode;
        node.isEnd = true;
        node.walkable = true;
        this.updateNodeUI(node);
    }

    setWalkable(node: INode, walkable: boolean): void {
        if (node.isStart || node.isEnd) return;
        node.walkable = walkable;
        this.updateNodeUI(node);
    }

    resetNodeState(node: GridNode): void {
        node.isVisited = false;
        node.isFrontier = false;
        node.isPath = false;
        node.parent = null;
        node.gCost = Infinity;
        node.hCost = 0;
    }

    clearGrid(clearWalls: boolean): void {
        for (let row = 0; row < this.rows; ++row) {
            for (let col = 0; col < this.cols; ++col) {
                const node = this.grid[row][col];
                this.resetNodeState(node);
                if (clearWalls && !node.isStart && !node.isEnd) {
                    node.walkable = true;
                }
                this.updateNodeUI(node);
            }
        }
    }

    // ============ Visualization State Methods ============

    setNodeVisited(node: INode): void {
        node.isVisited = true;
        this.updateNodeUI(node);
    }

    setNodeFrontier(node: INode): void {
        node.isFrontier = true;
        this.updateNodeUI(node);
    }

    setNodePath(node: INode): void {
        node.isPath = true;
        this.updateNodeUI(node);
    }

    clearNodeState(node: INode): void {
        node.isVisited = false;
        node.isFrontier = false;
        node.isPath = false;
        this.updateNodeUI(node);
    }

    // ============ UI Rendering ============

    private render(): void {
        if (!this.container) return;

        this.container.innerHTML = "";
        this.container.className = "grid border-2 border-gray-700 cursor-crosshair relative touch-none pt-px pl-px select-none shadow-[0px_0px_23px_4px_#2d3748]";
        this.container.style.gridTemplateRows = `repeat(${this.rows}, ${this.cellSize}px)`;
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSize}px)`;

        for (let row = 0; row < this.rows; ++row) {
            for (let col = 0; col < this.cols; ++col) {
                const node = this.grid[row][col];
                const element = this.createNodeElement(node);
                this.container.appendChild(element);
                this.cellElements.set(node.id, element);
            }
        }
    }

    private createNodeElement(node: GridNode): HTMLElement {
        const element = document.createElement('div');
        element.id = `cell-${node.id}`;
        element.dataset.row = node.row.toString();
        element.dataset.col = node.col.toString();
        element.className = this.getNodeClasses(node);
        return element;
    }

    private getNodeClasses(node: INode): string {
        let bg: string = STATE_STYLES.default;

        if (node.isPath) bg = STATE_STYLES.path;
        else if (node.isStart) bg = STATE_STYLES.start;
        else if (node.isEnd) bg = STATE_STYLES.end;
        else if (node.isVisited) bg = STATE_STYLES.visited;
        else if (node.isFrontier) bg = STATE_STYLES.frontier || 'bg-blue-300 opacity-50';
        else if (!node.walkable) bg = STATE_STYLES.wall;

        return `${CELL_BASE} ${bg}`;
    }

    private getCursorStyle(node: INode): string {
        return (node.isStart || node.isEnd) ? 'grab' : 'crosshair';
    }

    private updateNodeUI(node: INode): void {
        const element = this.cellElements.get(node.id);
        if (element) {
            element.className = this.getNodeClasses(node);
            element.style.cursor = this.getCursorStyle(node);
        }
    }

    private updateAllNodesUI(): void {
        for (let row = 0; row < this.rows; ++row) {
            for (let col = 0; col < this.cols; ++col) {
                this.updateNodeUI(this.grid[row][col]);
            }
        }
    }

    // ============ Input Handling ============

    private getCoordsFromPoint(x: number, y: number): { row: number; col: number } | null {
        if (!this.container) return null;

        const rect = this.container.getBoundingClientRect();
        const relx = x - rect.left;
        const rely = y - rect.top;

        const row = Math.floor(rely / this.cellSize);
        const col = Math.floor(relx / this.cellSize);

        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return { row, col };
        }
        return null;
    }

    handleMouseDown(x: number, y: number, setStart: boolean = false, setEnd: boolean = false): void {
        const coords = this.getCoordsFromPoint(x, y);
        if (!coords) return;

        const node = this.getNodeAt(coords.row, coords.col);
        if (!node) return;

        if (node.isStart || node.isEnd) {
            this.draggedNode = node;
            this.isDraggingStartOrEnd = true;
            const element = this.cellElements.get(node.id);
            if (element) element.style.cursor = 'grabbing';
            return;
        }

        if (setStart) {
            this.setStart(coords.row, coords.col);
            return;
        }

        if (setEnd) {
            this.setEnd(coords.row, coords.col);
            return;
        }

        this.isDrawing = true;
        this.drawMode = node.walkable ? 'wall' : 'erase';
        this.setWalkable(node, this.drawMode === 'erase');
    }

    handleMouseMove(x: number, y: number): void {
        const coords = this.getCoordsFromPoint(x, y);
        if (!coords) return;

        const node = this.getNodeAt(coords.row, coords.col);
        if (!node) return;

        if (this.isDraggingStartOrEnd && this.draggedNode) {
            if (node.walkable && !node.isStart && !node.isEnd) {
                const isStart = this.draggedNode.isStart;
                if (isStart) this.setStart(coords.row, coords.col);
                else this.setEnd(coords.row, coords.col);
                this.draggedNode = isStart ? this.startNode! : this.endNode!;
            }
            return;
        }

        if (!this.isDrawing || node.isStart || node.isEnd) return;

        const shouldBeWalkable = this.drawMode === 'erase';
        if (node.walkable !== shouldBeWalkable) {
            this.setWalkable(node, shouldBeWalkable);
        }
    }

    handleMouseUp(): void {
        this.isDrawing = false;
        if (this.draggedNode) {
            const element = this.cellElements.get(this.draggedNode.id);
            if (element) element.style.cursor = 'grab';
            this.draggedNode = null;
        }
        this.isDraggingStartOrEnd = false;
    }

    destroy(): void {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.cellElements.clear();
    }
}