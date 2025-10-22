export const GRID_ROWS = 20;
export const GRID_COLS = 50;

export const START_NODE_POS = { row: 10, col: 10 };
export const END_NODE_POS = { row: 10 , col: 40 };

export const CELL_COLORS = {
    default: 'bg-gray-900 border-gray-800',
    wall: 'bg-gray-700',
    start: 'bg-green-500',
    end: 'bg-red-500',
    visited: 'bg-blue-400',
    path: 'bg-yellow-400',
} as const;