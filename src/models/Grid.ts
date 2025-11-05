import { GridNode } from "./Node";
import { IGraph } from "../types";
import { INode } from "../types";

export default class Grid implements IGraph {
    // Grid structure
    private grid: GridNode[][] = [];
    private rows: number = 0;
    private cols: number = 0;
    private cellSize: number = 0;
    private majorInterval = 0;

    // Start and end nodes
    private startNode: GridNode | null = null;
    private endNode: GridNode | null = null;

    // DOM/UI references
    private container: HTMLElement | null = null;
    private cellElements: Map<string, HTMLElement> = new Map();

    // Input handling
    private drawMode: 'wall' | 'erase' = 'wall';
    private isDrawing: boolean = false;
    private draggedNode: INode | null = null;
    private isDraggingStartOrEnd: boolean = false;

    constructor(initialCellSize: number) {
        this.cellSize = initialCellSize;
    }

    private createGrid(): void {
        this.grid = [];
        for (let row = 0; row < this.rows; ++row) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; ++col) {
                const id = `${row}-${col}`;
                this.grid[row][col] = new GridNode(id, row, col);
            }
        }
        this.setStartNode(0, 0);
        this.setEndNode(this.rows - 1, this.cols - 1);
    }

    getNode(row: number, col: number): INode | null {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    getDimensions(): { rows: number; cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    // ============ IGraph Implementation ============

    getStartNode(): INode | null {
        return this.startNode;
    }

    getEndNode(): INode | null {
        return this.endNode;
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
            const neighbor = this.getNode(newRow, newCol);
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

    setStartNode(row: number, col: number): void {
        const node = this.getNode(row, col);
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

    setEndNode(row: number, col: number): void {
        const node = this.getNode(row, col);
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

    setNodeWalkable(node: INode, walkable: boolean): void {
        if (node.isStart || node.isEnd) return;
        node.walkable = walkable;
        this.updateNodeUI(node);
    }

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

    // ============ Node State Reset/Clear Methods ============

    resetNodeState(node: GridNode): void {
        node.isVisited = false;
        node.isFrontier = false;
        node.isPath = false;
        node.parent = null;
        node.gCost = Infinity;
        node.hCost = 0;
        this.updateNodeUI(node);
    }

    resetGrid(clearWalls: boolean): void {
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


    // ============ UI Rendering ============

    mount(container: HTMLElement): void {
        this.container = container;
        this.container.style.setProperty("--cell-size", `${this.cellSize}px`);
        this.resizeToContainer();

        new ResizeObserver(() => this.resizeToContainer()).observe(this.container.parentElement!);
    }

    private resizeToContainer(): void {
        if (!this.container) return;
        const parent = this.container.parentElement;
        if (!parent) return;
        const { width, height } = parent.getBoundingClientRect();
        this.cols = Math.floor(width / this.cellSize);
        this.rows = Math.floor(height / this.cellSize);
        this.majorInterval = Math.max(2, Math.round(150 / this.cellSize));
        this.container.style.width = `${this.cols * this.cellSize}px`;
        this.container.style.height = `${this.rows * this.cellSize}px`;
        this.createGrid();
        this.render();
    }

    private render(): void {
        if (!this.container) return;
        this.container.innerHTML = "";
        this.cellElements.clear();

        for (let row = 0; row < this.rows; ++row) {
            for (let col = 0; col < this.cols; ++col) {
                const node = this.grid[row][col];
                const element = this.createNodeElement(node);
                this.container.appendChild(element);
                this.cellElements.set(node.id, element);
            }
        }
    }

    private applyCellBorders(node: GridNode, element: HTMLElement): void {
        element.style.borderLeft = '';
        element.style.borderTop = '';

        if (!node.walkable || node.isStart || node.isEnd || node.isVisited || node.isFrontier || node.isPath) {
            return;
        }

        const isMajorRow = node.row % this.majorInterval === 0;
        const isMajorCol = node.col % this.majorInterval === 0;
        const minorColor = 'oklch(0.3 0.01 270 / 0.35)';
        const majorColor = 'oklch(0.3 0.01 270 / 0.8)';

        if (node.col > 0) {
            element.style.borderLeft = `1px solid ${isMajorCol ? majorColor : minorColor}`;
        }
        if (node.row > 0) {
            element.style.borderTop = `1px solid ${isMajorRow ? majorColor : minorColor}`;
        }
    }

    setCellSize(newCellSize: number): void {
        if (newCellSize <= 0) return;
        this.cellSize = newCellSize;
        if (this.container) {
            this.container.style.setProperty("--cell-size", `${this.cellSize}px`);
        }
        this.resizeToContainer();
    }

    private createNodeElement(node: GridNode): HTMLElement {
        const element = document.createElement("div");
        element.id = `cell-${node.id}`;
        element.dataset.row = node.row.toString();
        element.dataset.col = node.col.toString();
        element.className = this.getNodeClasses(node);
      
        const top = node.row * this.cellSize;
        const left = node.col * this.cellSize;
        element.style.position = "absolute";
        element.style.width = `${this.cellSize}px`;
        element.style.height = `${this.cellSize}px`;
        element.style.top = `${top}px`;
        element.style.left = `${left}px`;
        this.applyCellBorders(node, element);
      
        return element;
    }

    private getNodeClasses(node: INode): string {
        const classes = ["node"];
      
        if (node.isPath) classes.push("node-path");
        else if (node.isStart) classes.push("node-start");
        else if (node.isEnd) classes.push("node-end");
        else if (node.isVisited) classes.push("node-visited");
        else if (node.isFrontier) classes.push("node-frontier");
        else if (!node.walkable) classes.push("node-wall");
      
        return classes.join(" ");
    }

    private getCursorStyle(node: INode): string {
        return (node.isStart || node.isEnd) ? 'grab' : 'crosshair';
    }

    private updateNodeUI(node: INode): void {
        const element = this.cellElements.get(node.id);
        if (element) {
            element.className = this.getNodeClasses(node);
            element.style.cursor = this.getCursorStyle(node);
            if (node instanceof GridNode) this.applyCellBorders(node as GridNode, element);
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

    private getGridCoordinates(x: number, y: number): { row: number; col: number } | null {
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

    handleMouseDown(x: number, y: number, makeStartNode: boolean = false, makeEndNode: boolean = false): void {
        const coords = this.getGridCoordinates(x, y);
        if (!coords) return;

        const node = this.getNode(coords.row, coords.col);
        if (!node) return;

        if (node.isStart || node.isEnd) {
            this.draggedNode = node;
            this.isDraggingStartOrEnd = true;
            const element = this.cellElements.get(node.id);
            if (element) element.style.cursor = 'grabbing';
            return;
        }

        if (makeStartNode) {
            this.setStartNode(coords.row, coords.col);
            return;
        }

        if (makeEndNode) {
            this.setEndNode(coords.row, coords.col);
            return;
        }

        this.isDrawing = true;
        this.drawMode = node.walkable ? 'wall' : 'erase';
        this.setNodeWalkable(node, this.drawMode === 'erase');
    }

    handleMouseMove(x: number, y: number): void {
        const coords = this.getGridCoordinates(x, y);
        if (!coords) return;

        const node = this.getNode(coords.row, coords.col);
        if (!node) return;

        if (this.isDraggingStartOrEnd && this.draggedNode) {
            if (node.walkable && !node.isStart && !node.isEnd) {
                const isStart = this.draggedNode.isStart;
                if (isStart) this.setStartNode(coords.row, coords.col);
                else this.setEndNode(coords.row, coords.col);
                this.draggedNode = isStart ? this.startNode! : this.endNode!;
            }
            return;
        }

        if (!this.isDrawing || node.isStart || node.isEnd) return;

        const shouldBeWalkable = this.drawMode === 'erase';
        if (node.walkable !== shouldBeWalkable) {
            this.setNodeWalkable(node, shouldBeWalkable);
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
        this.container = null;
    }
}