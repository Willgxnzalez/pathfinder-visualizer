import React, { useState, useEffect, useRef, useCallback } from "react";
import Grid from "../models/Grid";

interface GridViewProps {
    onGridReady: (grid: Grid) => void;
}

export default function GridView({ onGridReady }: GridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<Grid | null>(null);
    const [gridSize, setGridSize] = useState(() => calculateGridSize());

    function calculateGridSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cellSize = width < 768 ? 30 : 25;
        const cols = Math.floor(width / cellSize);
        const availableHeight = Math.floor(height * 0.65);
        const rows = Math.floor(availableHeight / cellSize);
        return { rows, cols, cellSize };
    }

    useEffect(() => {
        if (containerRef.current && !gridRef.current) {
            const { rows, cols, cellSize } = gridSize;
            containerRef.current.innerHTML = "";
            containerRef.current.className = "grid border-1 border-border-main cursor-crosshair touch-none select-none pt-px pl-px select-none";
            containerRef.current.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
            containerRef.current.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
            gridRef.current = new Grid(rows, cols, cellSize, containerRef.current);
            onGridReady(gridRef.current);
        }

        return () => {
            gridRef.current?.destroy();
            gridRef.current = null;
        };
    }, [onGridReady]);

    useEffect(() => {
        const resizeGrid = () => {
            const newSize = calculateGridSize();
            setGridSize(newSize);
            if (!containerRef.current || !gridRef.current) return;
            containerRef.current.style.gridTemplateRows = `repeat(${newSize.rows}, ${newSize.cellSize}px)`;
            containerRef.current.style.gridTemplateColumns = `repeat(${newSize.cols}, ${newSize.cellSize}px)`;
            gridRef.current.resize(newSize.rows, newSize.cols, newSize.cellSize);
        };
        window.addEventListener("resize", resizeGrid);
        resizeGrid();
        return () => window.removeEventListener("resize", resizeGrid);
    }, []);

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