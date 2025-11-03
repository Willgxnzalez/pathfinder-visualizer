import React, { useEffect, useRef } from "react";
import Grid from "../models/Grid";

interface GridViewProps {
    grid: Grid;
    onDrawingChange?: (isDrawing: boolean) => void;
}

export default function GridView({ grid, onDrawingChange }: GridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        grid.mount(containerRef.current);
        return () => grid.destroy();
    }, [grid]);

    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-0 flex justify-center items-center grid-background select-none cursor-crosshair touch-none"
            ref={containerRef}
            onMouseDown={(e) => {
                onDrawingChange?.(true);
                grid.handleMouseDown(
                    e.clientX,
                    e.clientY,
                    e.shiftKey && e.button === 0,
                    e.shiftKey && e.button === 2
                );
            }}
            onMouseMove={(e) => grid.handleMouseMove(e.clientX, e.clientY)}
            onMouseUp={() => { onDrawingChange?.(false); grid.handleMouseUp(); }}
            onMouseLeave={() => { onDrawingChange?.(false); grid.handleMouseUp(); }}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
}
