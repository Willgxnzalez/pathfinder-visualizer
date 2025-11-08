export type Algorithm = 'BFS' | 'DFS' | 'A*' | 'GBFS' | 'Dijkstra';
export type MazeAlgorithm = 'RecursiveBacktracking' | 'Prim' | 'Kruskal' | 'DFS';
export type Speed = 'slow' | 'medium' | 'fast';
export type AnimationState = 'idle' | 'running' | 'paused' | 'stepping';
export type ViewMode = 'grid' | 'map';

export interface INode {
    id: string;
    isWalkable: boolean;
    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isFrontier: boolean;
    isPath: boolean;
    gCost: number;
    hCost: number;
    fCost: () => number;
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
    nodesVisited: number;
    path: INode[];
}

export interface MazeGenerationResult {
    found: boolean;
    pathLength: number;
    nodesVisited: number;
    path: INode[];
    success: boolean;
    cellsProcessed: INode[];

}

export interface AnimationStep {
    type: 'visit' | 'path' | 'wall' | 'carve';
    node: INode;
}

export function isGridNode(node: INode): node is IGridNode {
    return 'row' in node && 'col' in node;
}

export function isMapNode(node: INode): node is IMapNode {
    return 'lat' in node && 'lon' in node;
}