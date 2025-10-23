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

    useEffect(() => {
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

    return (
        <div className="border-2 border-gray-700 rounded-lg p-2 bg-gray-950 select-none">
            <div
                ref={containerRef}
                className="cursor-crosshair"
                style={{ touchAction: 'none' }}
            />
        </div>
    );
}