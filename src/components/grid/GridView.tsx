import React, { useEffect, useCallback, useRef } from "react";
import GridManager from "./GridManager";
import GridGraph from "./GridGraph";

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
        
        const setStart = e.button === 0 && e.shiftKey;
        const setEnd = e.button === 2 && e.shiftKey;

        managerRef.current.handleMouseDown(e.clientX, e.clientY, setStart, setEnd);
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
        <div className="select-none shadow-[0px_0px_23px_4px_#2d3748]">
            <div
                ref={containerRef}
                style={{ touchAction: 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
}