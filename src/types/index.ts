export interface GridCell { // The data used for pathfinding algorithms
    id: number;
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

export interface INode {
    id: number;
    walkable: boolean;

    gCost: number;
    hCost: number;
    fCost: number;
    parent: INode | null;

    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isPath: boolean;
}

export interface IEdge {
    from: INode;
    to: INode;
    weight: number;
}

export type Algorithm = 'bfs' | 'dfs' | 'astar' | 'dijkstra';
