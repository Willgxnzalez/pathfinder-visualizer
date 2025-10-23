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
    expect(graph.getCell(-1, 2)).toBeNull();
    expect(graph.getCell(2, -1)).toBeNull();
    expect(graph.getCell(99, 0)).toBeNull();
    expect(graph.getCell(0, 99)).toBeNull();
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
    // Set a new start
    graph.setStart(2, 2);
    expect(cell.isStart).toBe(false);
    expect(graph.getCell(2, 2)!.isStart).toBe(true);

    // Do similarly for end
    graph.setEnd(0, 2);
    let endCell = graph.getCell(0, 2)!;
    expect(endCell.isEnd).toBe(true);
    graph.setEnd(2, 0);
    expect(endCell.isEnd).toBe(false);
    expect(graph.getCell(2, 0)!.isEnd).toBe(true);

    // Access private fields directly for testing purposes
    expect((graph as any).startRow).toBe(2);
    expect((graph as any).startCol).toBe(2);
    expect((graph as any).endRow).toBe(2);
    expect((graph as any).endCol).toBe(0);
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
