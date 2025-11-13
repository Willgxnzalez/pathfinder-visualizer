import { expect, test } from 'vitest'
import GridGraph from '../src/models/Grid';

test('GridGraph creates grid and nodes correctly', () => {
    const rows = 5;
    const cols = 4;
    const graph = new GridGraph(rows, cols);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = graph.getNode(r, c);
            expect(node).toBeDefined();
            expect(node!.row).toBe(r);
            expect(node!.col).toBe(c);
            expect(node!.isWalkable).toBe(true);
            expect(node!.isStart).toBe(false);
            expect(node!.isEnd).toBe(false);
            expect(node!.isVisited).toBe(false);
            expect(node!.isPath).toBe(false);
        }
    }
});

test('GridGraph getNode(row, col) returns correct node', () => {
    const graph = new GridGraph(6, 7);
    const node = graph.getNode(2, 3);
    expect(node).toBeDefined();
    expect(node!.row).toBe(2);
    expect(node!.col).toBe(3);

    // Out of bounds should return undefined
    expect(graph.getNode(-1, 2)).toBeNull();
    expect(graph.getNode(2, -1)).toBeNull();
    expect(graph.getNode(99, 0)).toBeNull();
    expect(graph.getNode(0, 99)).toBeNull();
});

test('GridGraph setNodeWalkable sets walkable correctly', () => {
    const graph = new GridGraph(4, 4);
    const node = graph.getNode(1, 2)!;
    expect(node.isWalkable).toBe(true);

    graph.setNodeWalkable(node, false); // should set as not walkable
    expect(node.isWalkable).toBe(false);

    graph.setNodeWalkable(node, true); // should set as walkable
    expect(node.isWalkable).toBe(true);
});

test('GridGraph getDimensions returns correct size', () => {
    const graph = new GridGraph(12, 34);
    expect(graph.getDimensions()).toEqual({ rows: 12, cols: 34 });
});

test('GridGraph node iteration returns correct nodes', () => {
    const graph = new GridGraph(3, 5);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
            const node = graph.getNode(r, c);
            expect(node).toBeDefined();
            expect(node!.row).toBe(r);
            expect(node!.col).toBe(c);
        }
    }
});

test('GridGraph start/end setters', () => {
    const graph = new GridGraph(3, 3);

    // Set as start
    graph.setStartNode(1, 1);
    let node = graph.getNode(1, 1)!;
    expect(node.isStart).toBe(true);
    expect(graph.getStartNode()).toBe(node);

    // Set a new start
    graph.setStartNode(2, 2);
    expect(node.isStart).toBe(false);
    expect(graph.getNode(2, 2)!.isStart).toBe(true);
    expect(graph.getStartNode()!.id).toBe('2-2');

    // Do similarly for end
    graph.setEndNode(0, 2);
    let endNode = graph.getNode(0, 2)!;
    expect(endNode.isEnd).toBe(true);
    expect(graph.getEndNode()!.id).toBe('0-2');

    graph.setEndNode(2, 0);
    expect(endNode.isEnd).toBe(false);
    expect(graph.getNode(2, 0)!.isEnd).toBe(true);
    expect(graph.getEndNode()!.id).toBe('2-0');
});

test('GridGraph does not set wall on start or end', () => {
    const graph = new GridGraph(2, 2);
    graph.setStartNode(1, 0);
    graph.setEndNode(1, 1);

    graph.setNodeWalkable(graph.getNode(1, 0)!, false); // start node
    graph.setNodeWalkable(graph.getNode(1, 1)!, false); // end node

    expect(graph.getNode(1, 0)!.isWalkable).toBe(true);
    expect(graph.getNode(1, 1)!.isWalkable).toBe(true);

    // should allow walls on non start/end
    graph.setNodeWalkable(graph.getNode(0, 0)!, false);
    expect(graph.getNode(0, 0)!.isWalkable).toBe(false);
});

test('GridGraph.getNeighbors returns walkable neighbors only', () => {
    const graph = new GridGraph(3, 3);
    const target1 = graph.getNode(1, 1)!;
    graph.setNodeWalkable(target1, false);

    // (1,0) neighbors: (0,0), (2,0), (1,1)
    const node10 = graph.getNode(1, 0)!;
    const neighbors = graph.getNeighbors(node10);
    const neighborIds = neighbors.map((n: any) => n.id);
    expect(neighborIds).toContain('0-0');
    expect(neighborIds).toContain('2-0');
    expect(neighborIds).not.toContain('1-1');

    // Make (1,0) not walkable, check (1,1)'s neighbors returns only walkables
    graph.setNodeWalkable(node10, false);
    const node11 = graph.getNode(1, 1)!;
    const neighbors2 = graph.getNeighbors(node11);
    const neighborIds2 = neighbors2.map((n: any) => n.id);
    expect(neighborIds2).toContain('0-1');
    expect(neighborIds2).toContain('2-1');
    expect(neighborIds2).toContain('1-2');
    expect(neighborIds2).not.toContain('1-0');
});

test('GridGraph.getNode(row, col) returns undefined out of bounds', () => {
    const graph = new GridGraph(2, 2);
    expect(graph.getNode(-1, 0)).toBeNull();
    expect(graph.getNode(0, -1)).toBeNull();
    expect(graph.getNode(2, 0)).toBeNull();
    expect(graph.getNode(0, 2)).toBeNull();
    expect(graph.getNode(1, 1)).toBeDefined();
});
