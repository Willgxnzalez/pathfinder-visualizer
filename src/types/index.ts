export interface GridCell { // The data used for pathfinding algorithms
    row: number;
    col: number;
    isWall: boolean;
    isStart: boolean;
    isEnd: boolean;

    // Pathfinding state
    isVisited: boolean;
    isPath: boolean;
    gCost: number;
    hCost: number;
    parent: GridCell | null;
}

export type Algorithm = 'bfs' | 'dfs' | 'astar' | 'dijkstra';
