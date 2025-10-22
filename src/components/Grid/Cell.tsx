import React, { memo } from 'react';
import { CELL_COLORS } from '../../utils/constants';

interface CellProps { // Only use data that causes a re-render
    row: number;
    col: number;
    isWall: boolean;
    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isPath: boolean;
    onMouseDownHandler: (row: number, col: number) => void;
    onMouseEnterHandler: (row: number, col: number) => void;
    onMouseUpHandler: () => void;
}

function Cell({
    row,
    col,
    isWall,
    isStart,
    isEnd,
    isVisited,
    isPath,
    onMouseDownHandler,
    onMouseEnterHandler,
    onMouseUpHandler,
}: CellProps) {

    const BASE_CELL_CLASS = `
        w-6 h-6 border border-gray-800
        cursor-pointer
    `;

    const getCellType = () => {
        if (isStart) return CELL_COLORS.start;
        if (isEnd) return CELL_COLORS.end;
        if (isPath) return CELL_COLORS.path;
        if (isVisited) return CELL_COLORS.visited;
        if (isWall) return CELL_COLORS.wall;
        return CELL_COLORS.default;
    }

    return (
        <div 
            className={`${BASE_CELL_CLASS} ${getCellType()}`}
            onMouseDown={() => onMouseDownHandler(row, col)}
            onMouseEnter={() => onMouseEnterHandler(row, col)}
            onMouseUp={onMouseUpHandler}
        />
    );
}

export default memo(Cell) ;