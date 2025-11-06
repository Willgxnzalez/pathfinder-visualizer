export const CELL_SIZE_STEP = 5;
const MAJOR_GRID_PIXEL_INTERVAL = 150;
const START_ROW_POSITION = 0.5;
const START_COL_POSITION = 0.2;
const END_ROW_POSITION = 0.5;
const END_COL_POSITION = 0.8;

export function snapTo(step: number, value: number): number {
    return Math.floor(value / step) * step;
}

export function computeCellSizeBounds(container?: HTMLElement): { min: number; max: number; step: number, initial: number } {
    const rect = container?.getBoundingClientRect();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;

    const minRows = 14;
    const maxRows = 28;
    const minCols = width < 640 ? 10 : 16;
    const maxCols = width < 640 ? 22 : 42;

    const sizeForMaxDensity = Math.min(Math.floor(width / maxCols), Math.floor(height / maxRows));
    const sizeForMinDensity = Math.min(Math.floor(width / minCols), Math.floor(height / minRows));

    const min = snapTo(CELL_SIZE_STEP, Math.max(12, Math.min(80, sizeForMaxDensity)));
    const max = snapTo(CELL_SIZE_STEP, Math.max(min + CELL_SIZE_STEP, Math.min(220, sizeForMinDensity)));
    const midpoint = Math.floor((min + max) / 2);
    return { min, max, step: CELL_SIZE_STEP, initial: midpoint };
}

export function getMajorGridInterval(cellSize: number) {
    return Math.max(2, Math.round(MAJOR_GRID_PIXEL_INTERVAL / cellSize));
}

export function computeDefaultStartEndNodes(rows: number, cols: number): {
    startRow: number, startCol: number, 
    endRow: number, endCol: number 
} {
    const startRow = Math.floor(rows * START_ROW_POSITION);
    const startCol = Math.floor(cols * START_COL_POSITION);
    const endRow = Math.floor(rows * END_ROW_POSITION);
    const endCol = Math.floor(cols * END_COL_POSITION);

    return { startRow, startCol, endRow, endCol };
}