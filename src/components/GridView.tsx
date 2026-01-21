import React, { RefObject, useCallback, PointerEvent } from 'react';
import GridRenderer from '../models/GridRenderer';

interface GridViewProps {
    gridViewRef: RefObject<HTMLDivElement | null>;
    renderer: GridRenderer | null;
    onDrawingChange?: (drawing: boolean) => void;
}

// GridView is the React component that serves as the mounting point for the GridRenderer.
// It provides the DOM element (via gridViewRef) where the grid visualization is rendered,
// and connects pointer events to the renderer's logic for interactive pathfinding grid manipulation.
export default function GridView({
    gridViewRef,
    renderer,
    onDrawingChange,
}: GridViewProps) {
    const handlePointerDown = useCallback(
        (e: PointerEvent) => {
            if (!renderer) return;

            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);

            onDrawingChange?.(true);

            const makeStart = e.shiftKey && e.button === 0;
            const makeEnd = e.shiftKey && e.button === 2;

            renderer.handleMouseDown(e.clientX, e.clientY, makeStart, makeEnd);
        },
        [renderer, onDrawingChange]
    );

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!renderer) return;
            renderer.handleMouseMove(e.clientX, e.clientY);
        },
        [renderer]
    );

    const handlePointerUp = useCallback(
        (e: PointerEvent) => {
            if (!renderer) return;

            onDrawingChange?.(false);
            renderer.handleMouseUp();

            try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {}
        },
        [renderer, onDrawingChange]
    );

    return (
        <div
            ref={gridViewRef}
            className="relative select-none overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={e => e.preventDefault()}
        />
    );
}
