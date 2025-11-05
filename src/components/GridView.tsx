import React, { useEffect, useRef, useCallback } from "react";
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

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onDrawingChange?.(true);
        grid.handleMouseDown(
            e.clientX,
            e.clientY,
            e.shiftKey && e.button === 0,
            e.shiftKey && e.button === 2
        );
    }, [grid, onDrawingChange]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
         grid.handleMouseMove(e.clientX, e.clientY);
    }, [grid]);

    const handleMouseUp = useCallback(() => {
        onDrawingChange?.(false);
        grid.handleMouseUp();
    }, [grid, onDrawingChange]);

    const handleMouseLeave = useCallback(() => {
        onDrawingChange?.(false);
        grid.handleMouseUp();
    }, [grid, onDrawingChange]);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        onDrawingChange?.(true);
        grid.handleMouseDown(
            touch.clientX,
            touch.clientY,
            false,
            false
        );
    }, [grid, onDrawingChange]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        grid.handleMouseMove(touch.clientX, touch.clientY);
    }, [grid]);

    const handleTouchEndOrCancel = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrawingChange?.(false);
        grid.handleMouseUp();
    }, [grid, onDrawingChange]);

    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
    }, []);

    return (
        <div
            className="relative select-none cursor-crosshair touch-none"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEndOrCancel}
            onTouchCancel={handleTouchEndOrCancel}
            onContextMenu={handleContextMenu}
        />
    );
}
