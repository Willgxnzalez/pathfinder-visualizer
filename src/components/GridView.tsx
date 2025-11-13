// components/GridView.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import Grid from '../models/Grid';
import GridRenderer from '../models/GridRenderer';

interface GridViewProps {
    grid: Grid;
    nodeSize: number;
    onDrawingChange?: (drawing: boolean) => void;
    onRendererReady?: (renderer: GridRenderer) => void;
}

export default function GridView({
    grid,
    nodeSize,
    onDrawingChange,
    onRendererReady
}: GridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<GridRenderer | null>(null);

    // create once
    useEffect(() => {
        if (!containerRef.current) return;
        const renderer = new GridRenderer(grid, nodeSize);
        renderer.mount(containerRef.current);
        onRendererReady?.(renderer);
        rendererRef.current = renderer;
        return () => renderer.destroy();
    }, []);

    useEffect(() => {
        rendererRef.current?.updateGrid(grid, nodeSize);
    }, [grid, nodeSize]);

    useEffect(() => {
        rendererRef.current?.setNodeSize(nodeSize);
    }, [nodeSize]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        onDrawingChange?.(true);
        const makeStartNode = e.shiftKey && e.button === 0;
        const makeEndNode = e.shiftKey && e.button === 2;
        rendererRef.current?.handleMouseDown(e.clientX, e.clientY, makeStartNode, makeEndNode);
    }, [onDrawingChange]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        rendererRef.current?.handleMouseMove(e.clientX, e.clientY);
    }, []);

    const handleMouseUp = useCallback(() => {
        onDrawingChange?.(false);
        rendererRef.current?.handleMouseUp();
    }, [onDrawingChange]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        onDrawingChange?.(true);
        rendererRef.current?.handleMouseDown(touch.clientX, touch.clientY, false, false);
    }, [onDrawingChange]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        rendererRef.current?.handleMouseMove(touch.clientX, touch.clientY);
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        onDrawingChange?.(false);
        rendererRef.current?.handleMouseUp();
    }, [onDrawingChange]);

    return (
        <div
            className='absolute w-full h-full top-1/2 left-1/2 -translate-1/2 select-none overflow-hidden m-0 p-0 border-none'
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
        />
      );
      
}