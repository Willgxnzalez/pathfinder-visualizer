import { GridNode } from "./Node";
import { DrawMode } from "../types";
import GridGraph from "./Grid";

/**
 * GridRenderer handles DOM rendering for a Grid model.
 * Only visible nodes are shown due to lazy rendering.
 */
export default class GridRenderer {
    private container: HTMLElement | null = null;
    private renderedNodes: Map<string, HTMLElement> = new Map();
    private grid: GridGraph;
    private nodeSize: number;
    private majorInterval = 5;

    private drawMode: DrawMode = 'draw';
    private isDrawing: boolean = false;
    private isDraggingStartOrEnd: boolean = false;
    private draggedNode: GridNode | null = null;
    private lastCoords: { row: number; col: number } | null = null;

    constructor(grid: GridGraph, nodeSize = 25) {
        this.grid = grid;
        this.nodeSize = nodeSize;
    }

    mount(container: HTMLElement): void {
        this.container = container;
        this.container.className = "absolute w-full h-full top-1/2 left-1/2 -translate-1/2 select-none overflow-hidden m-0 p-0 border-none";
        this.updateContainerSize();
        this.updateBackgroundGrid();
        this.renderStartAndEnd();
    }

    destroy(): void {
        this.container?.replaceChildren();
        this.renderedNodes.clear();
    }

    private updateContainerSize(): void {
        if (!this.container) return;
        const { rows, cols } = this.grid.getDimensions();
        this.container.style.width = `${cols * this.nodeSize}px`;
        this.container.style.height = `${rows * this.nodeSize}px`;
    }

    private updateBackgroundGrid(): void {
        if (!this.container) return;

        const minorLineThickness = 1; // px
        const majorLineThickness = 2; // px

        // Remove any existing grid SVG
        const oldSvg = this.container.querySelector('svg.grid-background');
        if (oldSvg) oldSvg.remove();

        const { rows, cols } = this.grid.getDimensions();
        const width = cols * this.nodeSize;
        const height = rows * this.nodeSize;

        // === SVG Root ===
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add(
            'grid-background',
            'absolute',
            'inset-0',
            'w-full',
            'h-full',
            'pointer-events-none',
            'select-none'
        );
        svg.setAttribute('width', width.toString());
        svg.setAttribute('height', height.toString());
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('shape-rendering', 'crispEdges'); // make 1px lines sharp

        const addLine = (
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            color: string,
            thickness: number
        ) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1.toString());
            line.setAttribute('y1', y1.toString());
            line.setAttribute('x2', x2.toString());
            line.setAttribute('y2', y2.toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', thickness.toString());
            svg.appendChild(line);
        };

        // === Minor grid lines ===
        const minorLineColor = 'var(--color-grid-minor)';
        for (let col = 1; col < cols; col++) {
            const x = col * this.nodeSize + 0.5;
            addLine(x, 0, x, height, minorLineColor, minorLineThickness);
        }
        for (let row = 1; row < rows; row++) {
            const y = row * this.nodeSize + 0.5;
            addLine(0, y, width, y, minorLineColor, minorLineThickness);
        }

        // === Major grid lines ===
        const majorLineColor = 'var(--color-grid-major)';
        for (let col = this.majorInterval; col < cols; col += this.majorInterval) {
            const x = col * this.nodeSize + 0.5;
            addLine(x, 0, x, height, majorLineColor, majorLineThickness);
        }
        for (let row = this.majorInterval; row < rows; row += this.majorInterval) {
            const y = row * this.nodeSize + 0.5;
            addLine(0, y, width, y, majorLineColor, majorLineThickness);
        }

        // Mount SVG behind nodes
        this.container.prepend(svg);
    }
    
    

    setMajorInterval(interval: number): void {
        this.majorInterval = interval;
        this.updateBackgroundGrid();
    }

    private renderStartAndEnd(): void {
        const start = this.grid.getStartNode();
        const end = this.grid.getEndNode();
        start && this.addNodeElement(start);
        end && this.addNodeElement(end);
    }

    private addNodeElement(node: GridNode): void {
        if (!this.container || this.renderedNodes.has(node.id)) return;
        const el = document.createElement("div");
        el.id = `node-${node.id}`;
        el.dataset.id = node.id;
        el.className = this.getNodeClass(node);
        Object.assign(el.style, {
            position: "absolute",
            width: `${this.nodeSize}px`,
            height: `${this.nodeSize}px`,
            left: `${node.col * this.nodeSize}px`,
            top: `${node.row * this.nodeSize}px`,
            zIndex: "10",
        });
        this.container.appendChild(el);
        this.renderedNodes.set(node.id, el);
    }

    private removeNodeElement(node: GridNode): void {
        this.renderedNodes.get(node.id)?.remove();
        this.renderedNodes.delete(node.id);
    }

    private getNodeClass(node: GridNode): string {
        if (node.isStart) return "node-start";
        if (node.isEnd) return "node-end";
        if (!node.isWalkable) return "node-wall";
        if (node.isPath) return "node-path";
        if (node.isFrontier) return "node-frontier";
        if (node.isVisited) return "node-visited";
        return "node";
    }

    updateNode(node: GridNode): void {
        const el = this.renderedNodes.get(node.id);
        if (el) {
            el.className = this.getNodeClass(node);
            el.style.left = `${node.col * this.nodeSize}px`;
            el.style.top = `${node.row * this.nodeSize}px`;
        } else {
            this.addNodeElement(node);
        }
    }

    setNodeSize(size: number): void {
        this.nodeSize = size;
        for (const [id, el] of this.renderedNodes) {
            const node = this.grid.getNodeById(id);
            if (node) {
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
                el.style.left = `${node.col * size}px`;
                el.style.top = `${node.row * size}px`;
            }
        }
        this.updateBackgroundGrid();
    }

    updateGrid(newGrid: GridGraph, newSize: number): void {
        this.grid = newGrid;
        this.nodeSize = newSize;
        this.renderedNodes.clear();
        this.container?.replaceChildren();
        this.renderStartAndEnd();
        this.updateBackgroundGrid();
    }

    private getGridCoordinates(x: number, y: number): { row: number; col: number } | null {
        if (!this.container) return null;
        const rect = this.container.getBoundingClientRect();
        const row = Math.floor((y - rect.top) / this.nodeSize);
        const col = Math.floor((x - rect.left) / this.nodeSize);
        const { rows, cols } = this.grid.getDimensions();
        return row >= 0 && row < rows && col >= 0 && col < cols ? { row, col } : null;
    }

    private drawOrErase(node: GridNode): void {
        const shouldBeWalkable = this.drawMode === "erase";
        if (node.isWalkable !== shouldBeWalkable) {
            this.grid.setNodeWalkable(node, shouldBeWalkable);
            shouldBeWalkable ? this.removeNodeElement(node) : this.updateNode(node);
        }
    }

    private interpolateAndDraw(from: { row: number; col: number }, to: { row: number; col: number }): void {
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy)) + 1;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const row = Math.round(from.row + dy * t);
            const col = Math.round(from.col + dx * t);
            const node = this.grid.getNode(row, col);
            if (node && !node.isStart && !node.isEnd) this.drawOrErase(node);
        }
    }

    handleMouseDown(x: number, y: number, makeStart = false, makeEnd = false): void {
        const coords = this.getGridCoordinates(x, y);
        if (!coords) return;
        const node = this.grid.getNode(coords.row, coords.col);
        if (!node) return;

        if (node.isStart || node.isEnd) {
            this.draggedNode = node;
            this.isDraggingStartOrEnd = true;
            return;
        }
        if (makeStart) {
            this.removeNodeElement(this.grid.getStartNode()!);
            this.grid.setStartNode(coords.row, coords.col);
            this.updateNode(this.grid.getStartNode()!);
            return;
        }
        if (makeEnd) {
            this.removeNodeElement(this.grid.getEndNode()!);
            this.grid.setEndNode(coords.row, coords.col);
            this.updateNode(this.grid.getEndNode()!);
            return;
        }
        this.isDrawing = true;
        this.drawMode = node.isWalkable ? 'draw' : 'erase';
        this.drawOrErase(node);
        this.lastCoords = coords;
    }

    handleMouseMove(x: number, y: number): void {
        const coords = this.getGridCoordinates(x, y);
        if (!coords) return;

        if (this.isDraggingStartOrEnd && this.draggedNode) {
            const node = this.grid.getNode(coords.row, coords.col);
            if (!node || !node.isWalkable || node.isStart || node.isEnd) return;
            const isStart = this.draggedNode.isStart;
            this.removeNodeElement(this.draggedNode);

            isStart
                ? this.grid.setStartNode(coords.row, coords.col)
                : this.grid.setEndNode(coords.row, coords.col);

            this.draggedNode = isStart
                ? this.grid.getStartNode()
                : this.grid.getEndNode();

            this.updateNode(this.draggedNode!);
            return;
        }

        if (!this.isDrawing) return;
        if (this.lastCoords) this.interpolateAndDraw(this.lastCoords, coords);
        this.lastCoords = coords;
    }

    handleMouseUp(): void {
        this.isDrawing = false;
        this.isDraggingStartOrEnd = false;
        this.draggedNode = null;
        this.lastCoords = null;
    }
}