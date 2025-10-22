import { expect, test } from 'vitest'
import { createGrid } from '../../src/utils/gridHelpers'
import { GRID_ROWS, GRID_COLS } from '../../src/utils/constants';

test('Creates Grid', () => {
  const grid = createGrid();
  // Expect grid to be an array of rows
  expect(Array.isArray(grid)).toBe(true);

  expect(grid.length).toBe(GRID_ROWS);

  grid.forEach(row => {
    expect(Array.isArray(row)).toBe(true);
    expect(row.length).toBe(GRID_COLS);
  });

  const start = grid[10][10];
  expect(start.isStart).toBe(true);
  expect(start.isEnd).toBe(false);

  const end = grid[10][40];
  expect(end.isEnd).toBe(true);
  expect(end.isStart).toBe(false);

  // All other cells should not be start or end
  grid.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (
        !(rowIdx === 10 && colIdx === 10) &&
        !(rowIdx === 10 && colIdx === 40)
      ) {
        expect(cell.isStart).toBe(false);
        expect(cell.isEnd).toBe(false);
      }
      // Default cell state
      expect(cell.isWall).toBe(false);
      expect(cell.isVisited).toBe(false);
      expect(cell.isPath).toBe(false);
      expect(cell.distance).toBe(Infinity);
      expect(cell.prevCell).toBe(null);
    });
  });
});