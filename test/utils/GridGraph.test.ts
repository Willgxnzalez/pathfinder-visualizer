import { expect, test } from 'vitest'
import { GridGraph } from '../../src/components/grid/GridGraph';

test('GridGraph creates grid and nodes correctly', () => {
    const rows = 5;
    const cols = 4;
    const graph = new GridGraph(rows, cols);

    const nodes = graph.getAllNodes();
    expect(nodes.length).toBe(rows);
    for (let r = 0; r < rows; r++) {
        expect(nodes[r].length).toBe(cols);
        for (let c = 0; c < cols; c++) {
            expect(nodes[r][c]).toBeDefined();
            expect(nodes[r][c].row).toBe(r);
            expect(nodes[r][c].col).toBe(c);
            expect(nodes[r][c].walkable).toBe(true);
            expect(nodes[r][c].isStart).toBe(false);
            expect(nodes[r][c].isEnd).toBe(false);
            expect(nodes[r][c].isVisited).toBe(false);
            expect(nodes[r][c].isPath).toBe(false);
            // GridNode from GridGraph does not define gCost/hCost/parent directly in GridGraph public API; skip
        }
    }
});

test('GridGraph getNodeAt returns correct node', () => {
    const graph = new GridGraph(6, 7);
    const node = graph.getNodeAt(2, 3);
    expect(node).toBeDefined();
    expect(node!.row).toBe(2);
    expect(node!.col).toBe(3);

    // Out of bounds should return undefined
    expect(graph.getNodeAt(-1, 2)).toBeUndefined();
    expect(graph.getNodeAt(2, -1)).toBeUndefined();
    expect(graph.getNodeAt(99, 0)).toBeUndefined();
    expect(graph.getNodeAt(0, 99)).toBeUndefined();
});

test('GridGraph setWalkable toggles wall (walkable) correctly', () => {
    const graph = new GridGraph(4, 4);
    const node = graph.getNodeAt(1, 2)!;
    expect(node.walkable).toBe(true);

    graph.setWalkable(1, 2, false); // should set as not walkable
    expect(node.walkable).toBe(false);

    graph.setWalkable(1, 2, true); // should set as walkable
    expect(node.walkable).toBe(true);
});

test('GridGraph getDimensions returns correct size', () => {
    const graph = new GridGraph(12, 34);
    expect(graph.getDimensions()).toEqual({ rows: 12, cols: 34 });
});

test('GridGraph getAllNodes returns 2D array with correct nodes', () => {
    const graph = new GridGraph(3, 5);
    const nodes = graph.getAllNodes();
    expect(Array.isArray(nodes)).toBe(true);
    expect(nodes.length).toBe(3);
    for (let r = 0; r < 3; r++) {
        expect(nodes[r].length).toBe(5);
        for (let c = 0; c < 5; c++) {
            expect(nodes[r][c].row).toBe(r);
            expect(nodes[r][c].col).toBe(c);
        }
    }
});

test('GridGraph start/end setters', () => {
    const graph = new GridGraph(3, 3);

    // Set as start and end, ensure previous is cleared
    graph.setStart(1, 1);
    let node = graph.getNodeAt(1, 1)!;
    expect(node.isStart).toBe(true);

    // getStartNode matches assigned
    expect(graph.getStartNode()).toBe(node);

    // Set a new start
    graph.setStart(2, 2);
    expect(node.isStart).toBe(false);
    expect(graph.getNodeAt(2, 2)!.isStart).toBe(true);
    // Check id
    expect(graph.getStartNode()!.id).toBe(2 * 3 + 2);

    // Do similarly for end
    graph.setEnd(0, 2);
    let endNode = graph.getNodeAt(0, 2)!;
    expect(endNode.isEnd).toBe(true);
    expect(graph.getEndNode()!.id).toBe(0 * 3 + 2);

    graph.setEnd(2, 0);
    expect(endNode.isEnd).toBe(false);
    expect(graph.getNodeAt(2, 0)!.isEnd).toBe(true);
    expect(graph.getEndNode()!.id).toBe(2 * 3 + 0);
});

test('GridGraph does not set wall on start or end', () => {
    const graph = new GridGraph(2, 2);
    graph.setStart(1, 0);
    graph.setEnd(1, 1);

    graph.setWalkable(1, 0, false); // start node
    graph.setWalkable(1, 1, false); // end node

    expect(graph.getNodeAt(1, 0)!.walkable).toBe(true);
    expect(graph.getNodeAt(1, 1)!.walkable).toBe(true);

    // should allow walls on non start/end
    graph.setWalkable(0, 0, false);
    expect(graph.getNodeAt(0, 0)!.walkable).toBe(false);
});

test('GridGraph.getNode returns node for a cell by id', () => {
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
    // mark (1,1) as not walkable, should not be returned as neighbor
    graph.setWalkable(1, 1, false);

    // (1,0) neighbors: (0,0), (2,0), (1,1)
    // (1,1) is not walkable, so should not show up in neighbors
    const cellId = 1 * 3 + 0;
    const neighbors = graph.getNeighbors(cellId);
    // (0,0) and (2,0) are walkable
    const neighborIds = neighbors.map(n => n.id);
    expect(neighborIds).toContain(0 * 3 + 0); // (0,0)
    expect(neighborIds).toContain(2 * 3 + 0); // (2,0)
    // There should be no (1,1)
    expect(neighborIds).not.toContain(1 * 3 + 1);

    // Make (1,0) not walkable, check (1,1)'s neighbors returns only walkables
    graph.setWalkable(1, 0, false);
    // Now get neighbors for (1,1)
    const neighbors2 = graph.getNeighbors(1 * 3 + 1);
    // (0,1), (2,1), (1,0),(1,2) - but (1,0) is not walkable, so not included
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

test('GridGraph.getNodeAt(row, col) returns undefined out of bounds', () => {
    const graph = new GridGraph(2, 2);
    expect(graph.getNodeAt(-1, 0)).toBeUndefined();
    expect(graph.getNodeAt(0, -1)).toBeUndefined();
    expect(graph.getNodeAt(2, 0)).toBeUndefined();
    expect(graph.getNodeAt(0, 2)).toBeUndefined();
    expect(graph.getNodeAt(1,1)).toBeDefined();
});
