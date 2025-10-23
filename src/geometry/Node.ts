import { INode } from "../types";

export class Node implements INode {
    id: number;
    walkable: boolean;

    // Map-specific
    lat: number;
    lng: number;

    gCost: number = Infinity;
    hCost: number = 0;
    fCost: number = 0;
    parent: INode | null = null;

    isStart: boolean = false;
    isEnd: boolean = false;
    isVisited: boolean = false;
    isPath: boolean = false;

    constructor(id: number, lat: number, lng: number, walkable: boolean) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.walkable = walkable;
    }
}