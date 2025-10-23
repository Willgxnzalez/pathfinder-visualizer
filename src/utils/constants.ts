export const GRID_ROWS = 40;
export const GRID_COLS = 40;
export const CELL_SIZE = 20;

export const START_NODE_POS = { row: 0, col: 0 };
export const END_NODE_POS = { row: 39 , col: 39 };

export const CELL_COLORS = {
    default: 'bg-dark-gray',
    wall: 'bg-med-gray',
    start: 'bg-green-500',
    end: 'bg-red-500',
    visited: 'bg-blue-400',
    path: 'bg-yellow-400',
} as const;