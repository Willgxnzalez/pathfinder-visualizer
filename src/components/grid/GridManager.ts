import { GridNode } from "../../models/Node";
import GridGraph from "./GridGraph";
import { CELL_COLORS } from "../../utils/constants";
import { INode } from "../../types";

export default class GridManager {
    private container: HTMLElement;
    private graph: GridGraph;
    private cellSize: number;
    private cellElements: Map<string, HTMLElement>;
    private drawMode: 'wall' | 'erase' = 'wall';
    private isDrawing: boolean = false;
    private draggedNode: INode | null = null;
    private isDraggingStartOrEnd: boolean = false;

    constructor(container: HTMLElement, graph: GridGraph, cellSize: number) {
        this.container = container;
        this.graph = graph;
        this.cellSize = cellSize;
        this.cellElements = new Map();
        this.render();
    }

    private render(): void {
        const { rows, cols } = this.graph.getDimensions();

        this.container.innerHTML = "";
        this.container.className = "grid border-2 border-gray-700 cursor-crosshair relative touch-none pt-px pl-px";
        this.container.style.gridTemplateRows = `repeat(${rows}, ${this.cellSize}px)`;
        this.container.style.gridTemplateColumns = `repeat(${cols}, ${this.cellSize}px)`;

        for (let row = 0; row < rows; ++row) {
            for (let col = 0; col < cols; ++col) {
                const node = this.graph.getNodeAt(row, col);
                if (node) {
                    const element = this.createNodeElement(node);
                    this.container.appendChild(element);
                    this.cellElements.set(node.id, element);
                }
            }
        }
    }

    private createNodeElement(node: GridNode): HTMLElement {
        const element = document.createElement('div');
        element.id = `cell-${node.id}`;
        element.dataset.row = node.row.toString();
        element.dataset.col = node.col.toString();
        element.className = this.getNodeClasses(node);
        element.style.cursor = (node.isStart || node.isEnd) ? 'grab' : 'crosshair';
        return element;
    }

    private getNodeClasses(node: INode): string {
        const base = "border border-gray-700 transition-colors duration-150 -mt-px -ml-px box-border";

        let bg: string = CELL_COLORS.default;
        if (node.isStart) bg = CELL_COLORS.start;
        else if (node.isEnd) bg = CELL_COLORS.end;
        else if (node.isPath) bg = CELL_COLORS.path;
        else if (node.isVisited) bg = CELL_COLORS.visited;
        else if (!node.walkable) bg = CELL_COLORS.wall;

        return `${base} ${bg}`;
    }

    private getCoordsFromPoint(x: number, y: number): { row: number; col: number } | null {
        const rect = this.container.getBoundingClientRect();
        const relx = x - rect.left;
        const rely = y - rect.top;

        const row = Math.floor(rely / this.cellSize);
        const col = Math.floor(relx / this.cellSize);

        const { rows, cols } = this.graph.getDimensions();
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            return { row, col };
        }
        return null;
    }

    handleMouseDown(x: number, y: number, setStart: boolean = false, setEnd: boolean = false): void {
        const coords = this.getCoordsFromPoint(x, y);
        if (!coords) return;

        const node = this.graph.getNodeAt(coords.row, coords.col);
        if (!node) return;

        if (node.isStart || node.isEnd) {
            this.draggedNode = node;
            this.isDraggingStartOrEnd = true;
            const element = this.cellElements.get(node.id);
            if (element) element.style.cursor = 'grabbing';
            return;
        }

        if (setStart) {
            const oldStart = this.graph.getStartNode();
            this.graph.setStart(coords.row, coords.col);
            const newStart = this.graph.getStartNode();
            if (oldStart) this.updateNode(oldStart);
            if (newStart) this.updateNode(newStart);
            return;
        }

        if (setEnd) {
            const oldEnd = this.graph.getEndNode();
            this.graph.setEnd(coords.row, coords.col);
            const newEnd = this.graph.getEndNode();
            if (oldEnd) this.updateNode(oldEnd);
            if (newEnd) this.updateNode(newEnd);
            return;
        }

        this.isDrawing = true;
        this.drawMode = node.walkable ? 'wall' : 'erase';
        this.graph.setWalkable(node, this.drawMode === 'erase');
        this.updateNode(node);
    }

    handleMouseMove(x: number, y: number): void {
        const coords = this.getCoordsFromPoint(x, y);
        if (!coords) return;
    
        const node = this.graph.getNodeAt(coords.row, coords.col);
        if (!node) return;
    
        // Dragging start/end nodes
        if (this.isDraggingStartOrEnd && this.draggedNode) {
            if (node.walkable && !node.isStart && !node.isEnd) {
                const isStart = this.draggedNode.isStart;
                const oldNode = isStart ? this.graph.getStartNode() : this.graph.getEndNode();
    
                if (isStart) this.graph.setStart(coords.row, coords.col);
                else this.graph.setEnd(coords.row, coords.col);
    
                const newNode = isStart ? this.graph.getStartNode() : this.graph.getEndNode();
    
                if (oldNode) this.updateNode(oldNode);
                if (newNode) {
                    this.draggedNode = newNode;
                    this.updateNode(newNode);
                }
            }
            return;
        }
    
        // Drawing walls
        if (!this.isDrawing || node.isStart || node.isEnd) return;
    
        const shouldBeWalkable = this.drawMode === 'erase';
        if (node.walkable !== shouldBeWalkable) {
            this.graph.setWalkable(node, shouldBeWalkable);
            this.updateNode(node);
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

    updateNode(node: INode): void {
        const element = this.cellElements.get(node.id);
        if (element) {
            element.className = this.getNodeClasses(node);
            element.style.cursor = (node.isStart || node.isEnd) ? 'grab' : 'crosshair';
        }
    }

    updateAllNodes(): void {
        const { rows, cols } = this.graph.getDimensions();
        for (let row = 0; row < rows; ++row) {
            for (let col = 0; col < cols; ++col) {
                const node = this.graph.getNodeAt(row, col);
                if (node) this.updateNode(node);
            }
        }
    }

    destroy(): void {
        this.container.innerHTML = '';
        this.cellElements.clear();
    }
}