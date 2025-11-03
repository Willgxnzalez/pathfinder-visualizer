export const INIT_CELL_SIZE = window.innerWidth < 768 ? 20 : 24; // smaller cells on desktop

export const STATE_STYLES = {
    default: 'bg-transparent',
    wall: 'bg-surface-3',
    start: 'bg-green-500',
    end: 'bg-red-500',
    visited: 'bg-blue-400',
    path: 'bg-yellow-400',
    frontier: 'bg-blue-300 opacity-50'
} as const;