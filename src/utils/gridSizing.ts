export const CELL_SIZE_STEP = 5;
const MAJOR_GRID_PIXEL_INTERVAL = 150;

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



