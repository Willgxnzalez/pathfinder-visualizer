import { INode, IEdge } from "../types";

export default class Edge implements IEdge {
    from: INode;
    to: INode;
    weight: number;

    constructor(from: INode, to: INode, weight: number = 1) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}