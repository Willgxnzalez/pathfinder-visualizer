import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import GridView from './components/GridView';
import Header from './components/Header';
import Grid from './models/Grid';
import GridRenderer from './models/GridRenderer';
import usePathfinding from './hooks/usePathfinding';
import {
    computeCellSizeBounds,
    computeDefaultStartEndNodes,
    getMajorGridInterval,
    CELL_SIZE_STEP,
} from './utils/gridHelpers';
import type { Algorithm, Speed, AnimationState, AnimationStep } from './types';
import { GridNode } from './models/Node';

export default function App() {
    const mainRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<GridRenderer | null>(null);

    const [cellSize, setCellSize] = useState(25);
    const [cellMin, setCellMin] = useState(20);
    const [cellMax, setCellMax] = useState(120);
    const [cellStep, setCellStep] = useState(CELL_SIZE_STEP);


    const [grid, setGrid] = useState<Grid | null>(null);
    const [speed, setSpeed] = useState<Speed>('medium');
    const speedRef = useRef<Speed>(speed);
    const [algorithm, setAlgorithm] = useState<Algorithm>('A*');
    const [isDrawing, setIsDrawing] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const [result, setResult] = useState('');

    useEffect(() => {
        speedRef.current = speed;
        console.log("updated speed: ", speedRef.current)
    }, [speed])

    // Compute cell size bounds on mount
    useLayoutEffect(() => {
        if (!mainRef.current) return;
        const { min, max, step, initial } = computeCellSizeBounds(mainRef.current);
        setCellMin(min);
        setCellMax(max);
        setCellStep(step);
        setCellSize(initial);
    }, []);

    // Initialize grid on first layout
    useLayoutEffect(() => {
        if (!mainRef.current) return;
        const rect = mainRef.current.getBoundingClientRect();
        if (rect.width < 5 || rect.height < 5) return;

        const cols = Math.max(5, Math.floor(rect.width / cellSize));
        const rows = Math.max(5, Math.floor(rect.height / cellSize));
        const newGrid = new Grid(rows, cols);

        const { startRow, startCol, endRow, endCol } = computeDefaultStartEndNodes(rows, cols);
        newGrid.setStartNode(startRow, startCol);
        newGrid.setEndNode(endRow, endCol);

        setGrid(newGrid);
        if (rendererRef.current) {
            rendererRef.current.updateGrid(newGrid, cellSize);
            rendererRef.current.setMajorInterval(getMajorGridInterval(cellSize));
        }
    }, [cellSize]);

    // Handle window resize
    useLayoutEffect(() => {
        if (!mainRef.current) return;
        let resizeTimeout: number;

        const ro = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!mainRef.current || animationState !== 'idle') return;
                const rect = mainRef.current.getBoundingClientRect();
                if (rect.width < 5 || rect.height < 5) return;

                setGrid((prev) => {
                    const cols = Math.max(5, Math.floor(rect.width / cellSize));
                    const rows = Math.max(5, Math.floor(rect.height / cellSize));

                    if (prev) {
                        const { rows: prow, cols: pcol } = prev.getDimensions();
                        if (prow === rows && pcol === cols) return prev;
                    }

                    const newGrid = new Grid(rows, cols);
                    const { startRow, startCol, endRow, endCol } = computeDefaultStartEndNodes(rows, cols);
                    newGrid.setStartNode(startRow, startCol);
                    newGrid.setEndNode(endRow, endCol);
                    return newGrid;
                });
            }, 50);
        });

        ro.observe(mainRef.current);
        return () => {
            ro.disconnect();
            clearTimeout(resizeTimeout);
        };
    }, [cellSize, animationState]);

    const handleCellSizeChange = useCallback((newSize: number) => {
        const snapped = Math.max(cellMin, Math.min(cellMax, newSize - (newSize % CELL_SIZE_STEP)));
        setCellSize(snapped);
        rendererRef.current?.setCellSize(snapped);
        rendererRef.current?.setMajorInterval(getMajorGridInterval(snapped));
    }, [cellMin, cellMax]);

    const pathfinding = usePathfinding(
        speedRef,
        animationState,
        algorithm,
        grid,
        async (step: AnimationStep): Promise<void> => {
            if (!rendererRef.current || !grid) return;
            for (const node of step.nodes) {
                if (step.type === 'visit') {
                    node.isVisited = true;
                    node.isFrontier = false;
                } else if (step.type === 'path') {
                    await new Promise((r) => setTimeout(r, 50));
                    node.isPath = true;
                }
                rendererRef.current.updateNode(node as GridNode);
            }
            return;
        },
        setAnimationState,
        setResult
    );

    const handleReset = useCallback(() => {
        if (!grid) return;
        grid.resetGrid(true);
        const { rows, cols } = grid.getDimensions();
        const { startRow, startCol, endRow, endCol } = computeDefaultStartEndNodes(rows, cols);
        grid.setStartNode(startRow, startCol);
        grid.setEndNode(endRow, endCol);
        rendererRef.current?.updateAll();
        setAnimationState('idle');
        setResult('');
    }, [grid]);

    return (
        <div className="w-screen h-screen bg-surface-dark flex flex-col text-text-main overflow-hidden">
            <Header
                animationState={animationState}
                selectedAlgorithm={algorithm}
                speed={speed}
                cellSize={cellSize}
                cellMin={cellMin}
                cellMax={cellMax}
                cellStep={CELL_SIZE_STEP}
                onRun={pathfinding.animate}
                onReset={handleReset}
                onAlgorithmChange={setAlgorithm}
                onSpeedChange={setSpeed}
                onCellSizeChange={handleCellSizeChange}
                isDrawing={isDrawing}
                mapMode={false}
                onDarkModeToggle={() => {}}
                onMapModeToggle={() => {}}
            />

            <main ref={mainRef} className="flex-1 relative" style={{ ['--cell-size' as string]: `${cellSize}px` }}>
                {!grid && <div className="absolute inset-0 flex items-center justify-center">Loading grid...</div>}
                {grid && (
                    <GridView
                        key={`${grid.getDimensions().rows}-${grid.getDimensions().cols}`}
                        grid={grid}
                        cellSize={cellSize}
                        onDrawingChange={setIsDrawing}
                        onRendererReady={(renderer) => {
                            rendererRef.current = renderer;
                            renderer.setMajorInterval(getMajorGridInterval(cellSize));
                        }}
                    />
                )}
            </main>

            {animationState !== 'idle' && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-4 px-8 py-4 rounded-2xl glass shadow-lg border border-bdr bg-surface/90 backdrop-blur-lg">
                    <button onClick={pathfinding.handleStop} className="px-7 py-3 bg-warning hover:bg-warning-dark text-text-main font-bold rounded-xl transition border border-bdr shadow active:scale-95">
                        STOP
                    </button>
                    <button onClick={pathfinding.handlePlayPause} className="px-7 py-3 bg-accent hover:bg-accent-dark text-text-main font-bold rounded-xl transition border border-bdr shadow active:scale-95">
                        PLAY/PAUSE
                    </button>
                    <button onClick={pathfinding.handleStep} className="px-7 py-3 bg-purple-700 hover:bg-purple-800 text-text-main font-bold rounded-xl transition border border-bdr shadow active:scale-95">
                        STEP
                    </button>
                </div>
            )}

            {result && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl glass shadow-xl border border-bdr bg-surface/90 backdrop-blur-lg text-lg font-semibold text-text-main min-w-56 text-center">
                    {result}
                </div>
            )}
        </div>
    );
}