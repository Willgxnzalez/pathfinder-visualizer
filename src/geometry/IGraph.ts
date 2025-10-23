import { INode, IEdge } from '../types';

export interface IGraph {
    getNode(id: number): INode | null;
    getNeighbors(nodeId: number): INode[];
    getDistance(fromId: number, toId: number): number;
    getHeuristic(fromId: number, toId: number): number;

    getStartNodeId(): number | null;
    getEndNodeId(): number | null;

    resetPathFinding(): void;

    markVisited(nodeId: number): void;
    markPath(nodeId: number): void;
}


