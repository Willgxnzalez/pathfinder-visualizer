export type Algorithm = 'BFS' | 'DFS' | 'A*' | 'GBFS' | 'Dijkstra';
export type MazeAlgorithm = 'RecursiveBacktracking' | 'Prim' | 'Kruskal' | 'DFS';
export type Speed = 'slow' | 'medium' | 'fast';
export type AnimationState = 'idle' | 'running' | 'paused' | 'stepping';
export type VisualizationMode = 'grid' | 'map';

export interface INode {
    id: string;
    isWall: boolean;
    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isPath: boolean;
    isFrontier: boolean;
    
    gCost: number;
    hCost: number;
    parent: INode | null;
}

export interface IGridNode extends INode {
    row: number;
    col: number;
}

export interface IMapNode extends INode {
    lat: number;
    lon: number;
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

export interface PathfindingResult {
    found: boolean;
    pathLength: number;
    nodesVisited: number;
    path: INode[];
}

export interface AnimationStep {
    type: 'visit' | 'path';
    nodes: INode[];
}
