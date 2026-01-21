import React, { useRef, useState, useEffect } from 'react';
import GridView from './components/GridView';
import Header from './components/Header';
import Footer from './components/Footer';
import usePathfinding from './hooks/usePathfinding';
import useGrid from './hooks/useGrid';
import type { PathAlgorithm, Speed, AnimationState } from './types';

export default function App() {
    const gridContainerRef = useRef<HTMLElement>(null);
    const gridViewRef = useRef<HTMLDivElement>(null);

    const [speed, setSpeed] = useState<Speed>('medium');
    const speedRef = useRef(speed);
    const [algorithm, setAlgorithm] = useState<PathAlgorithm>('A*');
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState('');

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    const {
        grid,
        gridRenderer,
        nodeSize,
        nodeMin,
        nodeMax,
        nodeStep,
        handleNodeSizeChange,
        handleResetAll,
        handleResetAlgorithmState,
        handleClearWalls,
        handleAnimationStep,
    } = useGrid(
        gridContainerRef,
        gridViewRef,
        animationState,
        setAnimationState,
        setResult
    );

    const pathfinding = usePathfinding(
        speedRef,
        animationState,
        algorithm,
        grid,
        handleAnimationStep,
        setAnimationState,
        setResult,
        handleResetAlgorithmState
    );

    return (
        <div className="w-screen h-dvh flex flex-col bg-surface-dark overflow-hidden">
            <Header
                animationState={animationState}
                selectedAlgorithm={algorithm}
                speed={speed}
                nodeSize={nodeSize}
                nodeMin={nodeMin}
                nodeMax={nodeMax}
                nodeStep={nodeStep}
                onRun={pathfinding.animate}
                onResetAll={handleResetAll}
                onResetAlgorithmState={handleResetAlgorithmState}
                onClearWalls={handleClearWalls}
                onAlgorithmChange={setAlgorithm}
                onSpeedChange={setSpeed}
                onNodeSizeChange={handleNodeSizeChange}
                isDrawing={isDrawing}
                mapMode={false}
                onDarkModeToggle={() => {}}
                onMapModeToggle={() => {}}
            />

            <main
                ref={gridContainerRef}
                className="flex-1 min-h-0 relative flex justify-center items-center"
            >
                <GridView
                    gridViewRef={gridViewRef}
                    renderer={gridRenderer}
                    onDrawingChange={setIsDrawing}
                />

                {/* Playback controls */}
                {animationState !== 'idle' && (
                    <div className="absolute z-40 bottom-4 left-1/2 -translate-x-1/2 flex gap-4 px-8 py-4 rounded-2xl glass shadow-highlight border border-bdr-glass">
                        <button
                            onClick={pathfinding.handleStop}
                            className="px-7 py-3 rounded-xl font-bold transition border border-bdr-glass shadow-highlight
                                bg-surface-light-glass hover:bg-surface-highlight-glass text-text-muted hover:text-text-main"
                        >
                            STOP
                        </button>
                        <button
                            onClick={pathfinding.handlePlayPause}
                            className="px-7 py-3 rounded-xl font-bold transition border border-bdr-glass shadow-highlight 
                                bg-surface-light-glass hover:bg-surface-highlight-glass text-text-muted hover:text-text-main"
                        >
                            PLAY/PAUSE
                        </button>
                        <button
                            onClick={pathfinding.handleStep}
                            className="px-7 py-3 rounded-xl font-bold transition border border-bdr-glass shadow-highlight
                                bg-surface-light-glass hover:bg-surface-highlight-glass text-text-muted hover:text-text-main"
                        >
                            STEP
                        </button>
                    </div>
                )}

                {result && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl glass">
                        {result}
                    </div>
                )}
            </main>

            <Footer
                animationState={animationState}
                selectedAlgorithm={algorithm}
                speed={speed}
                onAlgorithmChange={setAlgorithm}
                onSpeedChange={setSpeed}
                onRun={pathfinding.animate}
                onResetAll={handleResetAll}
                onResetAlgorithmState={handleResetAlgorithmState}
                onClearWalls={handleClearWalls}
                isDrawing={isDrawing}
                mapMode={false}
            />
        </div>
    );
}