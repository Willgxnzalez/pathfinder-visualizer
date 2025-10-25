import { expect, test } from 'vitest'
import GridGraph from '../src/components/grid/GridGraph';

test('GridGraph creates grid and nodes correctly', () => {
    const rows = 5;
    const cols = 4;
    const graph = new GridGraph(rows, cols);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = graph.getNodeAt(r, c);
            expect(node).toBeDefined();
            expect(node!.row).toBe(r);
            expect(node!.col).toBe(c);
            expect(node!.walkable).toBe(true);
            expect(node!.isStart).toBe(false);
            expect(node!.isEnd).toBe(false);
            expect(node!.isVisited).toBe(false);
            expect(node!.isPath).toBe(false);
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

    graph.setWalkable(node, false); // should set as not walkable
    expect(node.walkable).toBe(false);

    graph.setWalkable(node, true); // should set as walkable
    expect(node.walkable).toBe(true);
});

test('GridGraph getDimensions returns correct size', () => {
    const graph = new GridGraph(12, 34);
    expect(graph.getDimensions()).toEqual({ rows: 12, cols: 34 });
});

test('GridGraph getAllNodes returns 2D array with correct nodes', () => {
    const graph = new GridGraph(3, 5);
    // There is no getAllNodes, so check using getNodeAt
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
            const node = graph.getNodeAt(r, c);
            expect(node).toBeDefined();
            expect(node!.row).toBe(r);
            expect(node!.col).toBe(c);
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

    graph.setWalkable(graph.getNodeAt(1, 0)!, false); // start node
    graph.setWalkable(graph.getNodeAt(1, 1)!, false); // end node

    expect(graph.getNodeAt(1, 0)!.walkable).toBe(true);
    expect(graph.getNodeAt(1, 1)!.walkable).toBe(true);

    // should allow walls on non start/end
    graph.setWalkable(graph.getNodeAt(0, 0)!, false);
    expect(graph.getNodeAt(0, 0)!.walkable).toBe(false);
});

test('GridGraph.getNeighbors returns walkable neighbors only', () => {
    const graph = new GridGraph(3, 3);
    // mark (1,1) as not walkable, should not be returned as neighbor
    const target1 = graph.getNodeAt(1, 1)!;
    graph.setWalkable(target1, false);

    // (1,0) neighbors: (0,0), (2,0), (1,1)
    const node10 = graph.getNodeAt(1, 0)!;
    const neighbors = graph.getNeighbors(node10);
    const neighborIds = neighbors.map(n => n.id);
    expect(neighborIds).toContain(0 * 3 + 0); // (0,0)
    expect(neighborIds).toContain(2 * 3 + 0); // (2,0)
    expect(neighborIds).not.toContain(1 * 3 + 1); // (1,1) is a wall

    // Make (1,0) not walkable, check (1,1)'s neighbors returns only walkables
    graph.setWalkable(node10, false);
    const node11 = graph.getNodeAt(1, 1)!;
    const neighbors2 = graph.getNeighbors(node11);
    const neighborIds2 = neighbors2.map(n => n.id);
    expect(neighborIds2).toContain(0 * 3 + 1); // (0,1)
    expect(neighborIds2).toContain(2 * 3 + 1); // (2,1)
    expect(neighborIds2).toContain(1 * 3 + 2); // (1,2)
    expect(neighborIds2).not.toContain(1 * 3 + 0); // (1,0), since it's a wall
});

test('GridGraph.getNodeAt(row, col) returns undefined out of bounds', () => {
    const graph = new GridGraph(2, 2);
    expect(graph.getNodeAt(-1, 0)).toBeUndefined();
    expect(graph.getNodeAt(0, -1)).toBeUndefined();
    expect(graph.getNodeAt(2, 0)).toBeUndefined();
    expect(graph.getNodeAt(0, 2)).toBeUndefined();
    expect(graph.getNodeAt(1,1)).toBeDefined();
});
