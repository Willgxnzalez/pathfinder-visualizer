export const CELL_SIZE_STEP = 5;

export const snapTo = (step: number, value: number): number =>
    Math.floor(value / step) * step;

export const computeCellSizeBounds = (): { min: number; max: number; step: number } => {
    const width = window.innerWidth;
    const height = window.innerHeight; // leave room for UI elements

    const minRows = 14;
    const maxRows = 28;
    const minCols = width < 640 ? 10 : 16;
    const maxCols = width < 640 ? 22 : 42;

    const sizeForMaxDensity = Math.min(Math.floor(width / maxCols), Math.floor(height / maxRows));
    const sizeForMinDensity = Math.min(Math.floor(width / minCols), Math.floor(height / minRows));

    const min = snapTo(CELL_SIZE_STEP, Math.max(12, Math.min(80, sizeForMaxDensity)));
    const max = snapTo(CELL_SIZE_STEP, Math.max(min + CELL_SIZE_STEP, Math.min(220, sizeForMinDensity)));
    return { min, max, step: CELL_SIZE_STEP };
};

export const computeInitialCellSize = (): number => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const targetCols = width < 640 ? 14 : width < 1024 ? 26 : 36;
    const targetRows = 25;

    const sizeByWidth = Math.floor(width / targetCols);
    const sizeByHeight = Math.floor(height / targetRows);
    const raw = Math.min(sizeByWidth, sizeByHeight);

    const { min, max, step } = computeCellSizeBounds();
    const clamped = Math.max(min, Math.min(max, raw));
    return clamped - (clamped % step);
};
