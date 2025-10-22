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
    onMouseDown: (row: number, col: number) => void;
    onMouseEnter: (row: number, col: number) => void;
    onMouseUp: () => void;
}

function Cell({
    row,
    col,
    isWall,
    isStart,
    isEnd,
    isVisited,
    isPath,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
}: CellProps) {

    const BASE_CELL_CLASS = `
        w-6 h-6 border border-gray-800
        transition-colors duration-200 ease-in-out
        cursor-pointer
    `;

    const getCellType = () => {
        if (isStart) return CELL_COLORS.start;
        if (isEnd) return CELL_COLORS.end;
        if (isPath) return CELL_COLORS.path;
        if (isVisited) return CELL_COLORS.visited;
        if (isWall) return CELL_COLORS.wall;
        return CELL_COLORS.default;
    };

    return (
        <div 
            className={`${BASE_CELL_CLASS} ${getCellType()}`}
            onMouseDown={() => onMouseDown(row, col)}
            onMouseEnter={() => onMouseEnter(row, col)}
            onMouseUp={onMouseUp}
        />
    );
}

export default memo(Cell, (prev, next) => { // Trigger re-renders only for visual props
    return (
        prev.isWall === next.isWall &&
        prev.isStart === next.isStart &&
        prev.isEnd === next.isEnd &&
        prev.isVisited === next.isVisited &&
        prev.isPath === next.isPath
    );
});