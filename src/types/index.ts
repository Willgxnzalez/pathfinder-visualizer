export interface INode {
    id: string;
    
    gCost: number;
    hCost: number;
    parent: INode | null;
    
    walkable: boolean;
    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isPath: boolean;
    isFrontier: boolean;
}

export interface IEdge {
    from: INode;
    to: INode;
    weight: number;
}

export interface IGraph {
    getNeighbors(node: INode): INode[];
    getDistance(from: INode, to: INode): number;
    getHeuristic(from: INode, to: INode): number;
    getStartNode(): INode | null;
    getEndNode(): INode | null;
}

export type Algorithm = 'bfs' | 'dfs' | 'astar' | 'gbfs' | 'dijkstra';

export type AnimationState = 'idle' | 'running' | 'paused' | 'stepping';

export interface AnimationStep {
    type: 'visit' | 'path';
    nodes: INode[];
}

export interface PathfindingResult {
    found: boolean;
    pathLength: number;
    nodesVisited: number;
    path: INode[];
}