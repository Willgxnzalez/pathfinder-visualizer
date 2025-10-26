import React, { useEffect, useRef, useCallback } from "react";
import Grid from "../../models/Grid";

interface GridViewProps {
    rows: number;
    cols: number;
    cellSize: number;
    onGridReady: (grid: Grid) => void;
}

export default function GridView({ rows, cols, cellSize, onGridReady }: GridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<Grid | null>(null);

    useEffect(() => {
        if (containerRef.current && !gridRef.current) {
            gridRef.current = new Grid(rows, cols, cellSize, containerRef.current);
            onGridReady(gridRef.current);

            // Set up styling
            containerRef.current.className = "grid border-2 border-gray-700 cursor-crosshair relative touch-none pt-px pl-px select-none shadow-[0px_0px_23px_4px_#2d3748]";
            containerRef.current.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
            containerRef.current.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        }

        return () => {
            gridRef.current?.destroy();
            gridRef.current = null;
        };
    }, [rows, cols, cellSize, onGridReady]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!gridRef.current) return;

        const setStart = e.button === 0 && e.shiftKey;
        const setEnd = e.button === 2 && e.shiftKey;

        gridRef.current.handleMouseDown(e.clientX, e.clientY, setStart, setEnd);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!gridRef.current) return;
        gridRef.current.handleMouseMove(e.clientX, e.clientY);
    }, []);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (!gridRef.current) return;
        gridRef.current.handleMouseUp();
    }, []);
    
    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
}