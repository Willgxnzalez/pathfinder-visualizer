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
    getStartNode(): INode | null;
    getEndNode(): INode | null;
    getNeighbors(node: INode): INode[];
    getDistance(from: INode, to: INode): number;
    getHeuristic(from: INode, to: INode): number;
}

export type Algorithm = 'BFS' | 'DFS' | 'A*' | 'GBFS' | 'Dijkstra';

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