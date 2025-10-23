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