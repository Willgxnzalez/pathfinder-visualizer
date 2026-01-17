import React, { useState, useRef, useEffect } from 'react';
import GridView from './components/GridView';
import Header from './components/Header';
import usePathfinding from './hooks/usePathfinding';
import useGrid from './hooks/useGrid';
import type { pathFindingAlgorithm, Speed, AnimationState } from './types';

export default function App() {
    const gridContainerRef = useRef<HTMLElement>(null);
    const gridViewRef = useRef<HTMLDivElement>(null);

    const [speed, setSpeed] = useState<Speed>('medium');
    const speedRef = useRef<Speed>(speed); // Reference since speed can change during animation
    const [algorithm, setAlgorithm] = useState<pathFindingAlgorithm>('A*');
    const [isDrawing, setIsDrawing] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const [result, setResult] = useState(''); 

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    const { grid, gridRenderer, nodeSize, nodeMin, nodeMax, nodeStep, handleNodeSizeChange, handleReset, handleAnimationStep } = useGrid( // called every rerender
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
        setResult
    );

    return (
        <div className='w-screen h-screen bg-surface-dark flex flex-col text-text-main overflow-hidden'>
            <Header
                animationState={animationState}
                selectedAlgorithm={algorithm}
                speed={speed}
                nodeSize={nodeSize}
                nodeMin={nodeMin}
                nodeMax={nodeMax}
                nodeStep={nodeStep}
                onRun={pathfinding.animate}
                onReset={handleReset}
                onAlgorithmChange={setAlgorithm}
                onSpeedChange={setSpeed}
                onNodeSizeChange={handleNodeSizeChange}
                isDrawing={isDrawing}
                mapMode={false}
                onDarkModeToggle={() => {}}
                onMapModeToggle={() => {}}
            />

            <main ref={gridContainerRef} className='flex-1 relative flex justify-center items-center'>
                <GridView
                    gridViewRef={gridViewRef}
                    renderer={gridRenderer}
                    onDrawingChange={setIsDrawing}
                />
            </main>
            
            {/* Playback controls */}
            {animationState !== 'idle' && (
                <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex gap-4 px-8 py-4 rounded-2xl glass shadow-highlight border border-bdr-glass">
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
            

            {/* Result display */}
            {result && (
                <div className='fixed Z-50 bottom-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl glass shadow-highlight border border-bdr-glass text-lg font-semibold text-text-main text-center'>
                    {result}
                </div>
            )}
        </div>
    );
}