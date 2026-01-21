export const NODE_SIZE_STEP = 5;
const MAJOR_GRID_PIXEL_INTERVAL = 150;
const INITIAL_NODE_SIZE_RATIO = 0.4;
const START_ROW_POSITION = 0.5;
const START_COL_POSITION = 0.2;
const END_ROW_POSITION = 0.5;
const END_COL_POSITION = 0.8;

export function snapTo(step: number, value: number): number {
    return Math.floor(value / step) * step;
}

export function computeNodeSizeBounds(container: HTMLElement): { min: number; max: number; step: number, initial: number } {
    const rect = container?.getBoundingClientRect();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;

    const isMobile = width <= 640;
    const isLargeDesktop = width >= 1440;

    let minRows: number;
    let maxRows: number;
    let minCols: number;
    let maxCols: number;

    if (isMobile) {
        minRows = 5;
        maxRows = 20;
        minCols = 6;
        maxCols = 25;
    } else if (isLargeDesktop) {
        minRows = 10;
        maxRows = 50;
        minCols = 20;
        maxCols = 100;
    } else { // Tablet / normal desktop
        minRows = 8;
        maxRows = 35;
        minCols = 16;
        maxCols = 75;
    }

    const sizeForMaxDensity = Math.min(Math.floor(width / maxCols), Math.floor(height / maxRows));
    const sizeForMinDensity = Math.min(Math.floor(width / minCols), Math.floor(height / minRows));

    const min = snapTo(NODE_SIZE_STEP, Math.max(12, Math.min(80, sizeForMaxDensity)));
    const max = snapTo(NODE_SIZE_STEP, Math.max(min + NODE_SIZE_STEP, Math.min(220, sizeForMinDensity)));
    const initial = Math.floor((min + max) * INITIAL_NODE_SIZE_RATIO);

    return { min, max, step: NODE_SIZE_STEP, initial };
}

export function getMajorGridInterval(nodeSize: number) {
    return Math.max(2, Math.round(MAJOR_GRID_PIXEL_INTERVAL / nodeSize));
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