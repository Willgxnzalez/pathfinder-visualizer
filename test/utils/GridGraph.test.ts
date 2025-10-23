import { expect, test } from 'vitest'
import { GridGraph } from '../../src/components/Grid/GridGraph';
import { GRID_ROWS, GRID_COLS } from '../../src/utils/constants';

test('GridGraph creates grid and cells correctly', () => {
    const rows = 5;
    const cols = 4;
    const graph = new GridGraph(rows, cols);

    // The internal .cells property is private, so we access via a cast for testing only
    // @ts-ignore
    const cells = graph.cells;
    expect(cells.length).toBe(rows);
    for (let r = 0; r < rows; r++) {
        expect(cells[r].length).toBe(cols);
        for (let c = 0; c < cols; c++) {
            expect(cells[r][c]).toBeDefined();
            expect(cells[r][c].row).toBe(r);
            expect(cells[r][c].col).toBe(c);
            expect(cells[r][c].isWall).toBe(false);
            expect(cells[r][c].isStart).toBe(false);
            expect(cells[r][c].isEnd).toBe(false);
            expect(cells[r][c].isVisited).toBe(false);
            expect(cells[r][c].isPath).toBe(false);
            expect(cells[r][c].gCost).toBe(Infinity);
            expect(cells[r][c].hCost).toBe(0);
            expect(cells[r][c].parent).toBeNull();
        }
    }
});

test('GridGraph getCell returns correct cell', () => {
    const graph = new GridGraph(6, 7);
    const cell = graph.getCell(2, 3);
    expect(cell).toBeDefined();
    expect(cell!.row).toBe(2);
    expect(cell!.col).toBe(3);

    // Out of bounds should return undefined
    expect(graph.getCell(-1, 2)).toBeUndefined();
    expect(graph.getCell(2, -1)).toBeUndefined();
    expect(graph.getCell(99, 0)).toBeUndefined();
    expect(graph.getCell(0, 99)).toBeUndefined();
});

test('GridGraph setWalkable toggles wall correctly', () => {
    const graph = new GridGraph(4, 4);
    const cell = graph.getCell(1, 2)!;
    expect(cell.isWall).toBe(false);

    graph.setWalkable(1, 2, false); // should set as wall
    expect(cell.isWall).toBe(true);

    graph.setWalkable(1, 2, true); // should remove wall
    expect(cell.isWall).toBe(false);
});

test('GridGraph getDimensions returns correct size', () => {
    const graph = new GridGraph(12, 34);
    expect(graph.getDimensions()).toEqual({ rows: 12, cols: 34 });
});

test('GridGraph getAllCells returns 2D array with correct cells', () => {
    const graph = new GridGraph(3, 5);
    const cells = graph.getAllCells();
    expect(Array.isArray(cells)).toBe(true);
    expect(cells.length).toBe(3);
    for (let r = 0; r < 3; r++) {
        expect(cells[r].length).toBe(5);
        for (let c = 0; c < 5; c++) {
            expect(cells[r][c].row).toBe(r);
            expect(cells[r][c].col).toBe(c);
        }
    }
});

test('GridGraph start/end setters', () => {
    const graph = new GridGraph(3, 3);

    // Set as start and end, ensure previous is cleared
    graph.setStart(1, 1);
    let cell = graph.getCell(1, 1)!;
    expect(cell.isStart).toBe(true);

    // getStartNodeId matches assigned
    expect(graph.getStartNodeId()).toBe(1 * 3 + 1);

    // Set a new start
    graph.setStart(2, 2);
    expect(cell.isStart).toBe(false);
    expect(graph.getCell(2, 2)!.isStart).toBe(true);
    // Check id
    expect(graph.getStartNodeId()).toBe(2 * 3 + 2);

    // Do similarly for end
    graph.setEnd(0, 2);
    let endCell = graph.getCell(0, 2)!;
    expect(endCell.isEnd).toBe(true);
    expect(graph.getEndNodeId()).toBe(0 * 3 + 2);

    graph.setEnd(2, 0);
    expect(endCell.isEnd).toBe(false);
    expect(graph.getCell(2, 0)!.isEnd).toBe(true);
    expect(graph.getEndNodeId()).toBe(2 * 3 + 0);
});

test('GridGraph does not set wall on start or end', () => {
    const graph = new GridGraph(2, 2);
    graph.setStart(1, 0);
    graph.setEnd(1, 1);

    graph.setWalkable(1, 0, false); // start node
    graph.setWalkable(1, 1, false); // end node

    expect(graph.getCell(1, 0)!.isWall).toBe(false);
    expect(graph.getCell(1, 1)!.isWall).toBe(false);

    // should allow walls on non start/end
    graph.setWalkable(0, 0, false);
    expect(graph.getCell(0, 0)!.isWall).toBe(true);
});

test('GridGraph.getNode returns INode for a cell by id', () => {
    const graph = new GridGraph(2, 3);
    const id = 1 * 3 + 2;
    // No cell should be wall by default
    const node = graph.getNode(id);
    expect(node).toBeDefined();
    expect(node!.id).toBe(id);
    expect(node!.walkable).toBe(true);
    expect(node!.isStart).toBe(false);
    expect(node!.isEnd).toBe(false);
    expect(node!.isVisited).toBe(false);
    expect(node!.isPath).toBe(false);
});

test('GridGraph.getNeighbors returns walkable neighbors only', () => {
    const graph = new GridGraph(3, 3);
    // mark (1,1) as a wall, should not be returned as neighbor
    graph.setWalkable(1, 1, false);

    // (1,0) neighbors: (0,0), (2,0), (1,1)
    // (1,1) is wall, so should not show up in neighbors
    const cellId = 1 * 3 + 0;
    const neighbors = graph.getNeighbors(cellId);
    // (0,0) and (2,0) are walkable
    const neighborIds = neighbors.map(n => n.id);
    expect(neighborIds).toContain(0 * 3 + 0); // (0,0)
    expect(neighborIds).toContain(2 * 3 + 0); // (2,0)
    // There should be no (1,1)
    expect(neighborIds).not.toContain(1 * 3 + 1);

    // Make (1,0) a wall, check (1,1)'s neighbors returns only walkables
    graph.setWalkable(1, 0, false);
    // Now get neighbors for (1,1)
    const neighbors2 = graph.getNeighbors(1 * 3 + 1);
    // (0,1), (2,1), (1,0),(1,2) - but (1,0) is wall, so not included
    const neighborIds2 = neighbors2.map(n => n.id);
    expect(neighborIds2).toContain(0 * 3 + 1); // (0,1)
    expect(neighborIds2).toContain(2 * 3 + 1); // (2,1)
    expect(neighborIds2).toContain(1 * 3 + 2); // (1,2)
    expect(neighborIds2).not.toContain(1 * 3 + 0);
});

test('GridGraph.getNode returns undefined for out-of-bounds id', () => {
    const graph = new GridGraph(2, 2);
    // Out of range: 2*2 = 4, should be undefined
    expect(graph.getNode(4)).toBeUndefined();
    expect(graph.getNode(-1)).toBeUndefined();
});

test('GridGraph.getCell(row, col) returns undefined out of bounds', () => {
    const graph = new GridGraph(2, 2);
    expect(graph.getCell(-1, 0)).toBeUndefined();
    expect(graph.getCell(0, -1)).toBeUndefined();
    expect(graph.getCell(2, 0)).toBeUndefined();
    expect(graph.getCell(0, 2)).toBeUndefined();
    expect(graph.getCell(1,1)).toBeDefined();
});
