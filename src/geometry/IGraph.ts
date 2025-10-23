import { INode, IEdge } from '../types';

export interface IGraph {
    getNode(id: String): INode | null;
    getNeighbors(nodeId: string): INode[];
    getDistance(fromId: string, toId: string): number;
    getHeuristic(fromId: string, toId: string): number;

    getStartNodeId(): string | null;
    getEndNodeId(): string | null;

    resetPathFinding(): void;

    markVisited(nodeId: string): void;
    markPath(nodeId: string): void;
}


