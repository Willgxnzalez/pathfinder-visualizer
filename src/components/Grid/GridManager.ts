import { GridCell } from "../../types";
import { GridGraph } from "./GridGraph";

export class GridManager {
    private container: HTMLElement;
    private graph: GridGraph;
    private cellSize: number;

    private drawMode: 'wall' | 'erase' = 'wall';

    constructor(container: HTMLElement, graph: GridGraph, cellSize: number) {
        this.container = container;
        this.graph = graph;
        this.cellSize = cellSize;
    }
}