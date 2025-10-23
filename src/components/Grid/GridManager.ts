import { GridCell } from "../../types";
import { GridGraph } from "./GridGraph";
import { CELL_COLORS } from "../../utils/constants";

export class GridManager {
    private container: HTMLElement;
    private graph: GridGraph;
    private cellSize: number;
    private cellElements: Map<number, HTMLElement>;
    private drawMode: 'wall' | 'erase' = 'wall';
    private isDrawing: boolean = false;

    constructor(container: HTMLElement, graph: GridGraph, cellSize: number) {
        this.container = container;
        this.graph = graph;
        this.cellSize = cellSize;
        this.cellElements = new Map();
        this.render();
    }

    private render(): void {
        const { rows, cols } = this.graph.getDimensions();

        this.container.innerHTML = '';
        this.container.className = 'grid border-2 border-gray-700 cursor-crosshair relative touch-none pt-px pl-px';
        this.container.style.gridTemplateRows = `repeat(${rows}, ${this.cellSize}px)`;
        this.container.style.gridTemplateColumns = `repeat(${cols}, ${this.cellSize}px)`;

        for (let row = 0; row < rows; ++row) {
            for (let col = 0; col < cols; ++col) {
                const cell = this.graph.getCell(row, col);
                if (cell) {
                    const cellElement = this.createCellElement(cell);
                    this.container.appendChild(cellElement);
                    this.cellElements.set(cell.id, cellElement);
                }
            }
        }
    }
    
    private createCellElement(cell: GridCell): HTMLElement {
        const element = document.createElement('div');
        element.id = `cell-${cell.row}-${cell.col}`;
        element.dataset.row = cell.row.toString();
        element.dataset.col = cell.col.toString();

        element.className = this.getCellClasses(cell);
        return element;
    }
    
    private getCellClasses(cell: GridCell): string {
        const base = 'border border-med-gray transition-colors duration-150 -mt-px -ml-px box-border';
    
        let bg: string = CELL_COLORS.default;
        if (cell.isStart) bg = CELL_COLORS.start;
        else if (cell.isEnd) bg = CELL_COLORS.end;
        else if (cell.isPath) bg = CELL_COLORS.path;
        else if (cell.isVisited) bg = CELL_COLORS.visited;
        else if (cell.isWall) bg = CELL_COLORS.wall;
    
        return `${base} ${bg}`;
    }

    private getCoordsFromPoint(x: number, y: number): { row: number, col: number } | null {
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

    handleMouseDown(x: number, y: number): void {
        const coords = this.getCoordsFromPoint(x, y);
        if (!coords) return;

        const cell = this.graph.getCell(coords.row, coords.col);
        if (!cell || cell.isStart || cell.isEnd) return;

        this.isDrawing = true;
        this.drawMode = cell.isWall ? 'erase' : 'wall';
        this.graph.setWalkable(coords.row, coords.col, cell.isWall);
        this.updateCell(coords.row, coords.col);
    }

    handleMouseMove(x: number, y: number): void {
        const coords = this.getCoordsFromPoint(x, y);
        if (!coords || !this.isDrawing) return;
    
        const cell = this.graph.getCell(coords.row, coords.col);
        if (!cell || cell.isStart || cell.isEnd) return;
    
        const shouldBeWalkable = this.drawMode === 'erase';
        if (!cell.isWall === shouldBeWalkable) return;
    
        this.graph.setWalkable(coords.row, coords.col, shouldBeWalkable);
        this.updateCell(coords.row, coords.col);
    }

    handleMouseUp(): void {
        this.isDrawing = false;
    }

    updateCell(row: number, col: number): void {
        const cell = this.graph.getCell(row, col);
        if (!cell) return;
        const cellElement = this.cellElements.get(cell.id);
        if (cell && cellElement) {
            cellElement.className = this.getCellClasses(cell);
        }
    }

    destroy(): void {
        this.container.innerHTML = '';
    }
}