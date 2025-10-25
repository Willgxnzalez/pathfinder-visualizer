import { INode } from "../types";

export class GridNode implements INode {
    id: string;
    row: number;
    col: number;

    gCost: number = Infinity;
    hCost: number = 0;
    parent: GridNode | null = null;

    walkable: boolean = true;
    isStart: boolean = false;
    isEnd: boolean = false;
    isVisited: boolean = false;
    isPath: boolean = false;

    constructor(id: string, row: number, col: number) {
        this.id = id;
        this.row = row;
        this.col = col;
    }
}

export class MapNode implements INode {
    id: string;
    walkable: boolean;

    lat: number;
    lng: number;

    gCost: number = Infinity;
    hCost: number = 0;
    fCost: number = 0;
    parent: MapNode | null = null;

    isStart: boolean = false;
    isEnd: boolean = false;
    isVisited: boolean = false;
    isPath: boolean = false;

    constructor(id: string, lat: number, lng: number, walkable: boolean) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.walkable = walkable;
    }
}