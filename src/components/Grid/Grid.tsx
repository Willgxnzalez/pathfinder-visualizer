import React, { useState, useCallback } from 'react';
import Cell from './Cell';
import { Cell as CellType } from '../../types/index';
import { toggleWall } from '../../utils/gridHelpers';
import { GRID_COLS, GRID_ROWS } from '../../utils/constants';

interface GridProps {
    grid: CellType[][];
    onGridChange: (newGrid: CellType[][] | ((prevGrid: CellType[][]) => CellType[][])) => void; // callback for parent
    isRunning: boolean;
}

export default function Grid({ grid, onGridChange, isRunning }: GridProps) {
    const [isMousePressed, setIsMousePressed] = useState(false);
    
    const handleMouseDown = useCallback((row: number, col: number) => {
      if (isRunning) return;
      setIsMousePressed(true);
      onGridChange(prevGrid => toggleWall(prevGrid, row, col));
    }, [isRunning, onGridChange]);
    
    const handleMouseEnter = useCallback((row: number, col: number) => {
      if (!isMousePressed || isRunning) return; // No input during animation
      onGridChange(prevGrid => toggleWall(prevGrid, row, col));
    }, [isMousePressed, isRunning, onGridChange]);
    
    const handleMouseUp = useCallback(() => {
      setIsMousePressed(false);
    }, []);
    
    return (
      <div
        className="inline-grid gap-0 border-2 border-gray-700 rounded-lg p-2 bg-gray-950"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`
        }}
        onMouseLeave={handleMouseUp}
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
            onMouseDownHandler={handleMouseDown}
            onMouseEnterHandler={handleMouseEnter}
            onMouseUpHandler={handleMouseUp}
          />
        ))}
      </div>
    );
}