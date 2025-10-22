import { expect, test } from 'vitest'
import { createGrid, toggleWall } from '../../src/utils/gridHelpers'
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

test('toggleWall toggles the wall state correctly', () => {
    const grid = createGrid();

    expect(grid[5][5].isWall).toBe(false);

    const gridAfterToggle = toggleWall(grid, 5, 5);
    expect(gridAfterToggle[5][5].isWall).toBe(true);

    const gridAfterToggleBack = toggleWall(gridAfterToggle, 5, 5);
    expect(gridAfterToggleBack[5][5].isWall).toBe(false);
});

test('toggleWall doesn\'t affect start and end cells', () => {
    const grid = createGrid();

    // Try toggling start position
    const toggledStart = toggleWall(grid, 10, 10);
    expect(toggledStart[10][10].isWall).toBe(false);

    // Try toggling end position
    const toggledEnd = toggleWall(grid, 10, 40);
    expect(toggledEnd[10][40].isWall).toBe(false);

    // Should not mutate original grid
    expect(grid[5][5].isWall).toBe(false);
});

test('toggleWall only mutates the specified cell for the given row', () => {
    const grid = createGrid();
    const newGrid = toggleWall(grid, 0, 0);

    // The toggled cell should have changed
    expect(grid[0][0].isWall).toBe(false);
    expect(newGrid[0][0].isWall).toBe(true);

    // Other cells in the same row stay the same
    for(let col = 1; col < GRID_COLS; col++) {
        expect(newGrid[0][col]).toEqual(grid[0][col]);
    }

    // Other rows reference equality
    for(let row = 1; row < GRID_ROWS; row++) {
        expect(newGrid[row]).toBe(grid[row]);
    }
});
