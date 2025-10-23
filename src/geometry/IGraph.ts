import { INode, IEdge } from '../types';

export interface IGraph {
    getNode(id: number): INode | undefined;
    getNeighbors(nodeId: number): INode[];
    getEdges(nodeId: number): IEdge[];
    getDistance(fromId: number, toId: number): number;
    getHeuristic(fromId: number, toId: number): number;

    getStartNodeId(): number | undefined;
    getEndNodeId(): number | undefined;

    resetPathFinding(): void;

    markVisited(nodeId: number): void;
    markPath(nodeId: number): void;
}


