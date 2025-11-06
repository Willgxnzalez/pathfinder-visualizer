import { INode, IGridNode, IMapNode} from "../types";

export class GridNode implements IGridNode {
    id: string;
    row: number;
    col: number;
    walkable: boolean = true;
    isStart: boolean = false;
    isEnd: boolean = false;
    isVisited: boolean = false;
    isFrontier: boolean = false;
    isPath: boolean = false;
    gCost: number = Infinity;
    hCost: number = 0;
    parent: GridNode | null = null;

    constructor(id: string, row: number, col: number) {
        this.id = id;
        this.row = row;
        this.col = col;
    }

    fCost(): number {
        return this.gCost + this.hCost;
    }
}

export class MapNode implements IMapNode {
    id: string;
    lat: number;
    lon: number;
    walkable: boolean;
    isStart: boolean = false;
    isEnd: boolean = false;
    isVisited: boolean = false;
    isFrontier: boolean = false;
    isPath: boolean = false;
    gCost: number = Infinity;
    hCost: number = 0;
    parent: MapNode | null = null;

    constructor(id: string, lat: number, lon: number, walkable: boolean) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.walkable = walkable;
    }

    fCost(): number {
        return this.gCost + this.hCost;
    }
}