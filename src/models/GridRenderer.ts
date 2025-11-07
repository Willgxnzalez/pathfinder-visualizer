// models/GridRenderer.ts
import { GridNode } from "./Node";
import Grid from "./Grid";

export default class GridRenderer {
    private container: HTMLElement | null = null;
    private cellElements: Map<string, HTMLElement> = new Map();
    private grid: Grid;
    private cellSize: number;
    private majorInterval: number = 5;

    // Input handling
    private drawMode: 'wall' | 'erase' = 'wall';
    private isDrawing: boolean = false;
    private draggedNode: GridNode | null = null;
    private isDraggingStartOrEnd: boolean = false;

    constructor(grid: Grid, cellSize: number = 25) {
        this.grid = grid;
        this.cellSize = cellSize;
    }

    mount(container: HTMLElement): void {
        this.container = container;
        // Reset all positioning and spacing to ensure (0,0) is at top-left
        this.container.style.position = "relative";
        this.container.style.userSelect = "none";
        this.container.style.overflow = "hidden";
        this.container.style.margin = "0";
        this.container.style.padding = "0";
        this.container.style.border = "0";
        this.render();
    }

    destroy(): void {
        if (this.container) {
            this.container.innerHTML = "";
        }
        this.cellElements.clear();
    }

    // Called by App when grid changes
    updateGrid(newGrid: Grid, newCellSize: number): void {
        console.log("changed grid")
        this.grid = newGrid;
        this.cellSize = newCellSize;
        this.render();
    }

    setCellSize(size: number): void {
        this.cellSize = size;
        if (this.container) {
            this.container.style.setProperty("--cell-size", `${this.cellSize}px`);
        }
        this.updatePositions();
    }

    private render(): void {
        if (!this.container) return;
        this.container.innerHTML = "";
        this.cellElements.clear();

        for (const node of this.grid.nodes()) {
            const el = this.createCell(node);
            this.container.appendChild(el);
            this.cellElements.set(node.id, el);
        }
    }

    private createCell(node: GridNode): HTMLElement {
        const el = document.createElement("div");
        el.id = `cell-${node.id}`;
        el.className = "node";
        el.dataset.row = node.row.toString();
        el.dataset.col = node.col.toString();

        Object.assign(el.style, {
            position: "absolute",
            width: `${this.cellSize}px`,
            height: `${this.cellSize}px`,
            left: `${node.col * this.cellSize}px`,
            top: `${node.row * this.cellSize}px`,
            boxSizing: "border-box",
            cursor: (node.isStart || node.isEnd) ? 'grab' : 'crosshair',
        });

        this.updateCell(node, el);
        return el;
    }

    updateNode(node: GridNode): void {
        const el = this.cellElements.get(node.id);
        if (el) this.updateCell(node, el);
    }

    updateAll(): void {
        for (const node of this.grid.nodes()) {
            this.updateNode(node);
        }
    }

    private updatePositions(): void {
        for (const node of this.grid.nodes()) {
            const el = this.cellElements.get(node.id);
            if (el) {
                el.style.width = `${this.cellSize}px`;
                el.style.height = `${this.cellSize}px`;
                el.style.left = `${node.col * this.cellSize}px`;
                el.style.top = `${node.row * this.cellSize}px`;
            }
        }
    }

    private updateCell(node: GridNode, el: HTMLElement): void {
        const classes = ["node"];

        // Priority order: path > start/end > frontier > visited > wall
        let state = "empty";
        if (node.isPath) {
            classes.push("node-path");
            state = "path";
        } else if (node.isStart) {
            classes.push("node-start");
            state = "start";
        } else if (node.isEnd) {
            classes.push("node-end");
            state = "end";
        } else if (node.isFrontier) {
            classes.push("node-frontier");
            state = "frontier";
        } else if (node.isVisited) {
            classes.push("node-visited");
            state = "visited";
        } else if (!node.isWalkable) {
            classes.push("node-wall");
            state = "wall";
        }

        el.className = classes.join(" ");
        el.dataset.state = state;
        el.style.cursor = (node.isStart || node.isEnd) ? 'grab' : 'crosshair';

        // Grid lines - only apply to isWalkable empty nodes
        el.style.border = "";
        el.style.borderLeft = "";
        el.style.borderTop = "";

        if (node.isWalkable && !node.isStart && !node.isEnd && !node.isVisited && !node.isFrontier && !node.isPath) {
            const isMajorRow = node.row % this.majorInterval === 0;
            const isMajorCol = node.col % this.majorInterval === 0;
            const minorColor = 'oklch(0.3 0.01 270 / 0.35)';
            const majorColor = 'oklch(0.3 0.01 270 / 0.8)';

            if (node.col > 0) {
                el.style.borderLeft = `1px solid ${isMajorCol ? majorColor : minorColor}`;
            }
            if (node.row > 0) {
                el.style.borderTop = `1px solid ${isMajorRow ? majorColor : minorColor}`;
            }
        }
    }

    setMajorInterval(interval: number): void {
        this.majorInterval = interval;
        this.updateAll();
    }

    // ============ Input Handling ============

    private getGridCoordinates(x: number, y: number): { row: number; col: number } | null {
        if (!this.container) return null;

        const rect = this.container.getBoundingClientRect();
        const relx = x - rect.left;
        const rely = y - rect.top;

        const row = Math.floor(rely / this.cellSize);
        const col = Math.floor(relx / this.cellSize);

        if (row >= 0 && row < this.grid.getDimensions().rows && col >= 0 && col < this.grid.getDimensions().cols) {
            return { row, col };
        }
        return null;
    }

    handleMouseDown(x: number, y: number, makeStartNode: boolean = false, makeEndNode: boolean = false): void {
        const coords = this.getGridCoordinates(x, y);
        if (!coords) return;

        const node = this.grid.getNode(coords.row, coords.col);
        if (!node) return;

        if (node.isStart || node.isEnd) {
            this.draggedNode = node;
            this.isDraggingStartOrEnd = true;
            const element = this.cellElements.get(node.id);
            if (element) element.style.cursor = 'grabbing';
            return;
        }

        if (makeStartNode) {
            this.grid.setStartNode(coords.row, coords.col);
            this.updateNode(node as GridNode);
            return;
        }

        if (makeEndNode) {
            this.grid.setEndNode(coords.row, coords.col);
            this.updateNode(node as GridNode);
            return;
        }

        this.isDrawing = true;
        this.drawMode = node.isWalkable ? 'wall' : 'erase';
        this.grid.setNodeWalkable(node, this.drawMode === 'erase');
        this.updateNode(node as GridNode);
    }

    handleMouseMove(x: number, y: number): void {
        const coords = this.getGridCoordinates(x, y);
        if (!coords) return;

        const node = this.grid.getNode(coords.row, coords.col);
        if (!node) return;

        if (this.isDraggingStartOrEnd && this.draggedNode) {
            if (node.isWalkable && !node.isStart && !node.isEnd) {
                const isStart = this.draggedNode.isStart;
                if (isStart) {
                    this.grid.setStartNode(coords.row, coords.col);
                    this.updateNode(this.draggedNode as GridNode);
                    this.draggedNode = this.grid.getStartNode() as GridNode;
                    this.updateNode(this.draggedNode);
                } else {
                    this.grid.setEndNode(coords.row, coords.col);
                    this.updateNode(this.draggedNode as GridNode);
                    this.draggedNode = this.grid.getEndNode() as GridNode;
                    this.updateNode(this.draggedNode);
                }
            }
            return;
        }
        if (!this.isDrawing || node.isStart || node.isEnd) return;

        const shouldBeWalkable = this.drawMode === 'erase';
        if (node.isWalkable !== shouldBeWalkable) {
            this.grid.setNodeWalkable(node, shouldBeWalkable);
            this.updateNode(node as GridNode);
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
}