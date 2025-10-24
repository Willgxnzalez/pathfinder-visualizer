import { INode, IEdge } from '../types';

export interface IGraph {
    getNeighbors(node: INode): INode[];
    getDistance(from: INode, to: INode): number;
    getHeuristic(from: INode, to: INode): number;
    getStartNode(): INode | undefined;
    getEndNode(): INode | undefined;
}



