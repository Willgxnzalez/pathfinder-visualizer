import React, { RefObject, useCallback} from 'react';
import GridRenderer from '../models/GridRenderer';

interface GridViewProps {
    gridViewRef: RefObject<HTMLDivElement | null>;
    renderer: GridRenderer | null;
    onDrawingChange?: (drawing: boolean) => void;
}

// GridView is the React component that serves as the mounting point for the GridRenderer.
// It provides the DOM element (via gridViewRef) where the grid visualization is rendered,
// and connects pointer/touch events to the renderer's logic for interactive pathfinding grid manipulation.
export default function GridView({ gridViewRef, renderer, onDrawingChange }: GridViewProps) {
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!renderer) return;
        onDrawingChange?.(true);
        renderer.handleMouseDown(e.clientX, e.clientY, e.shiftKey && e.button === 0, e.shiftKey && e.button === 2);
    },[renderer, onDrawingChange]);
    
    const handleMouseUp = useCallback(() => {
        if (!renderer) return;
        onDrawingChange?.(false);
        renderer.handleMouseUp();
    }, [renderer, onDrawingChange]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!renderer) return;
        renderer.handleMouseMove(e.clientX, e.clientY);
    }, [renderer]);
    
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!renderer) return;
        e.preventDefault();
        const touch = e.touches[0];
        onDrawingChange?.(true);
        renderer.handleMouseDown(touch.clientX, touch.clientY, false, false);
    }, [renderer, onDrawingChange]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!renderer) return;
        e.preventDefault();
        const touch = e.touches[0];
        renderer.handleMouseMove(touch.clientX, touch.clientY);
    }, [renderer]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!renderer) return;
        e.preventDefault();
        onDrawingChange?.(false);
        renderer.handleMouseUp();
    }, [renderer, onDrawingChange]);

    return (
        <div
            ref={gridViewRef}
            className='absolute select-none overflow-hidden m-0 p-0 border-none touch-none'
            onMouseDown={e => {
                handleMouseDown(e);
                if (gridViewRef.current) gridViewRef.current.classList.add('cursor-crosshair');
            }}
            onMouseUp={() => {
                handleMouseUp();
                if (gridViewRef.current) gridViewRef.current.classList.remove('cursor-crosshair');
            }}
            onMouseLeave={() => {
                handleMouseUp();
                if (gridViewRef.current) gridViewRef.current.classList.remove('cursor-crosshair');
            }}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
}