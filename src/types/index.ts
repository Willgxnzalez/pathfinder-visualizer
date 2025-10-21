export interface Cell {
    row: number;
    col: number;
    isWall: boolean;
    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isPath: boolean;
    distance: number;
    prevCell: Cell | null;
}

export type Algorithm = 'bfs' | 'dfs' | 'astar' | 'dijkstra';

export interface GridPosition {
    row: number;
    col: number;
}