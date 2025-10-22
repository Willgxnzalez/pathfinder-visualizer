import React, { useState, useCallback, useRef } from 'react';
import Cell from './Cell';
import { Cell as CellType } from '../../types';
import { GRID_COLS } from '../../utils/constants';

interface GridProps {
    grid: CellType[][];
    onGridChange: React.Dispatch<React.SetStateAction<CellType[][]>>;
    isRunning: boolean;
}

export default function Grid({ grid, onGridChange, isRunning }: GridProps) {
    const [isPointerDown, setIsPointerDown] = useState(false);
    const drawModeRef = useRef<'wall' | 'erase'>('wall');
    const seenCellsRef = useRef<Set<string>>(new Set());
    const lastCellRef = useRef<{ row: number; col: number } | null>(null);

    // Bresenham line interpolation between two cells
    const interpolateCells = useCallback((r1: number, c1: number, r2: number, c2: number) => {
        const cells: { row: number; col: number }[] = [];

        const dx = Math.abs(c2 - c1);
        const dy = Math.abs(r2 - r1);
        const sx = c1 < c2 ? 1 : -1;
        const sy = r1 < r2 ? 1 : -1;
        let err = dx - dy;

        let x = c1;
        let y = r1;
        
        while (true) {
            cells.push({ row: y, col: x });
            if (x === c2 && y === r2) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return cells;
    }, []);

    const handlePointerDown = useCallback(
        (row: number, col: number) => {
            if (isRunning) return;
            
            setIsPointerDown(true);
            lastCellRef.current = { row, col };
            seenCellsRef.current.clear();
            seenCellsRef.current.add(`${row}-${col}`);

            onGridChange((prevGrid) => {
                const cell = prevGrid[row][col];
                if (cell.isStart || cell.isEnd) return prevGrid;

                // Set draw mode based on clicked cell
                drawModeRef.current = cell.isWall ? 'erase' : 'wall';

                return prevGrid.map((r, rIdx) =>
                    rIdx === row
                        ? r.map((c, cIdx) =>
                            cIdx === col ? { ...c, isWall: !c.isWall } : c
                        )
                        : r
                );
            });
        },
        [isRunning, onGridChange]
    );

    const handlePointerEnter = useCallback(
        (row: number, col: number) => {
            if (!isPointerDown || isRunning) return;

            const last = lastCellRef.current;
            if (!last) {
                lastCellRef.current = { row, col };
                return;
            }

            // Get interpolated cells between last position and current
            const line = interpolateCells(last.row, last.col, row, col);
            lastCellRef.current = { row, col };

            // Filter out cells we've already seen
            const newCells = line.filter(({ row: r, col: c }) => {
                const key = `${r}-${c}`;
                if (seenCellsRef.current.has(key)) return false;
                seenCellsRef.current.add(key);
                return true;
            });

            if (newCells.length === 0) return;

            // Update all interpolated cells in one state update
            onGridChange((prevGrid) => {
                let newGrid = prevGrid;

                for (const { row: r, col: c } of newCells) {
                    const cell = newGrid[r][c];
                    if (cell.isStart || cell.isEnd) continue;

                    // Only toggle if it matches draw mode
                    const shouldToggle =
                        (drawModeRef.current === 'wall' && !cell.isWall) ||
                        (drawModeRef.current === 'erase' && cell.isWall);

                    if (!shouldToggle) continue;

                    newGrid = newGrid.map((rowCells, rowIdx) =>
                        rowIdx === r
                            ? rowCells.map((cellItem, colIdx) =>
                                colIdx === c
                                    ? { ...cellItem, isWall: drawModeRef.current === 'wall' }
                                    : cellItem
                            )
                            : rowCells
                    );
                }

                return newGrid;
            });
        },
        [isPointerDown, isRunning, interpolateCells, onGridChange]
    );

    const handlePointerUp = useCallback(() => {
        setIsPointerDown(false);
        lastCellRef.current = null;
        seenCellsRef.current.clear();
    }, []);

    return (
        <div
            className="inline-grid gap-0 border-2 border-gray-700 rounded-lg p-2 bg-gray-950"
            style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            }}
            onPointerLeave={handlePointerUp}
            onPointerUp={handlePointerUp}
        >
            {grid.flat().map((cell) => (
                <Cell
                    key={`${cell.row}-${cell.col}`}
                    row={cell.row}
                    col={cell.col}
                    isWall={cell.isWall}
                    isStart={cell.isStart}
                    isEnd={cell.isEnd}
                    isVisited={cell.isVisited}
                    isPath={cell.isPath}
                    onMouseDownHandler={handlePointerDown}
                    onMouseEnterHandler={handlePointerEnter}
                    onMouseUpHandler={handlePointerUp}
                />
            ))}
        </div>
    );
}