export interface INode {
    id: number;
    
    gCost: number;
    hCost: number;
    parent: INode | null;
    
    walkable: boolean;
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

export type AnimationState = 'idle' | 'running' | 'paused' | 'stepping';

export interface AnimationStep {
    type: 'visit' | 'path' | 'complete';
    nodeIds: number[];
}

export interface PathfindingResult {
    found: boolean;
    pathLength: number;
    nodesVisited: number;
    path: number[];
}