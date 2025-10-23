import React, { useEffect, useCallback, useRef } from 'react';
import { GridCell } from '../../types';
import { GridManager } from './GridManager';
import { GRID_COLS } from '../../utils/constants';
import { GridGraph } from './GridGraph';

interface GridViewProps {
    graph: GridGraph;
    manager: GridManager | null;
    cellSize: number;
    onManagerReady: (manager: GridManager) => void;
}

export default function Grid({ graph, manager, cellSize, onManagerReady }: GridViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const managerRef = useRef<GridManager | null>(null);

    useEffect(() => { // runs after component is mounted
        if (containerRef.current && !managerRef.current) {
            managerRef.current = new GridManager(containerRef.current, graph, cellSize);
            onManagerReady(managerRef.current);
        }
    
        return () => {
          if (managerRef.current) {
                managerRef.current.destroy();
                managerRef.current = null;
          }
        };
    }, [graph, cellSize, onManagerReady]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!managerRef.current) return;
        managerRef.current.handleMouseDown(e.clientX, e.clientY);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!managerRef.current) return;
        managerRef.current.handleMouseMove(e.clientX, e.clientY);
    }, []);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (!managerRef.current) return;
        managerRef.current.handleMouseUp();
    } , []);

    return (
        <div className="border-2 border-gray-700 rounded-lg p-2 bg-black select-none">
            <div
                ref={containerRef}
                style={{ touchAction: 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
}