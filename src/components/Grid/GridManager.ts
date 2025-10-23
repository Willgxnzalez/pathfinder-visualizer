import { GridCell } from "../../types";
import { GridGraph } from "./GridGraph";
import { CELL_COLORS } from "../../utils/constants";

export class GridManager {
    private container: HTMLElement;
    private graph: GridGraph;
    private cellSize: number;

    private drawMode: 'wall' | 'erase' = 'wall';

    constructor(container: HTMLElement, graph: GridGraph, cellSize: number) {
        this.container = container;
        this.graph = graph;
        this.cellSize = cellSize;
        this.render();
    }

    private render(): void {
        const { rows, cols } = this.graph.getDimensions();

        this.container.innerHTML = '';
        this.container.className = 'grid border-2 border-gray-700 rounded-lg bg-gray-950';
        this.container.style.gridTemplateRows = `repeat(${rows}, ${this.cellSize}px)`;
        this.container.style.gridTemplateColumns = `repeat(${cols}, ${this.cellSize}px)`;

        const cells = this.graph.getAllCells();
        for (let row = 0; row < rows; ++row) {
            for (let col = 0; col < cols; ++col) {
                const cell = cells[row][col];
                const cellElement = this.createCellElement(cell);
                this.container.appendChild(cellElement);
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
        const base = 'border border-gray-800 transition-colors duration-150';
    
        let bg: string = CELL_COLORS.default;
        if (cell.isStart) bg = CELL_COLORS.start;
        else if (cell.isEnd) bg = CELL_COLORS.end;
        else if (cell.isPath) bg = CELL_COLORS.path;
        else if (cell.isVisited) bg = CELL_COLORS.visited;
        else if (cell.isWall) bg = CELL_COLORS.wall;
    
        return `${base} ${bg}`;
    }

    destroy(): void {
        this.container.innerHTML = '';
    }
}