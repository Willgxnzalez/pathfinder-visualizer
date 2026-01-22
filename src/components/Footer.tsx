import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import LabelControl from './LabelControl';
import Dropdown from './Dropdown';
import { AnimationState, PathAlgorithm, Speed } from '../types';

type MazeGenAlgo = 'random' | 'recursive-division' | 'prim' | 'eller' | 'kruskal';

export interface FooterProps {
    // State & Mode
    mapMode: boolean;
    animationState: AnimationState;
    isDrawing?: boolean;

    // Algorithm Controls
    selectedAlgorithm: PathAlgorithm;
    selectedMazeGen?: MazeGenAlgo;
    speed: Speed;

    // Event Handlers
    onAlgorithmChange: (algo: PathAlgorithm) => void;
    onMazeGenChange?: (algo: MazeGenAlgo) => void;
    onSpeedChange: (s: Speed) => void;

    // Actions
    onRun: () => void;
    onResetAll: () => void;
    onResetAlgorithmState: () => void;
    onClearWalls?: () => void;
}

const ALGORITHM_OPTIONS: PathAlgorithm[] = ['BFS', 'DFS', 'A*', 'GBFS', 'Dijkstra'];
const MAZE_GEN_ALGOS: MazeGenAlgo[] = ['random', 'recursive-division', 'prim', 'eller', 'kruskal'];
const SPEED_OPTIONS: Speed[] = ['slow', 'medium', 'fast'];
const SPEED_SYMBOLS = ['>', '>>', '>>>'];

const SWIPE_THRESHOLD = 50; // px
const EXPANDED_RATIO = 0.8;
const COLLAPSED_RATIO = 0.2;

export default function Footer({
    mapMode,
    animationState,
    isDrawing,
    selectedAlgorithm,
    selectedMazeGen,
    speed,
    onAlgorithmChange,
    onMazeGenChange,
    onSpeedChange,
    onRun,
    onResetAll,
    onResetAlgorithmState,
    onClearWalls,
}: FooterProps) {
    const isAnimating = animationState !== 'idle';

    const [expanded, setExpanded] = useState(false);
    const [dragStartY, setDragStartY] = useState<number | null>(null);
    const [height, setHeight] = useState<number>(0);
    const [heights, setHeights] = useState<{ collapsed: number; expanded: number }>({ collapsed: 100, expanded: 100 });

    // Save collapsed height on mount or resize
    useEffect(() => {
        const updateHeights = () => {
            const collapsedHeight = (window.visualViewport?.height ?? window.innerHeight) * COLLAPSED_RATIO;
            const expandedHeight = (window.visualViewport?.height ?? window.innerHeight) * EXPANDED_RATIO;
            setHeights({collapsed: collapsedHeight, expanded: expandedHeight});
        };

        updateHeights();
        window.addEventListener('resize', updateHeights);
        return () => window.removeEventListener('resize', updateHeights);
    }, [expanded]);

    const handleSwipeStart = (clientY: number) => {
        setDragStartY(clientY);
    };

    const handleSwipeEnd = (clientY: number) => {
        if (dragStartY === null) return;

        const deltaY = dragStartY - clientY;
        if (deltaY > SWIPE_THRESHOLD) { // swipe up => expand
            setExpanded(true);
        } else if (deltaY < -SWIPE_THRESHOLD) { // swipe down => collapse
            setExpanded(false);
        } else { // Snap back
            setHeight(expanded ? heights.expanded : heights.collapsed);
        }
        setDragStartY(null);
    }

    const handleTouchStart = (e: React.TouchEvent) => handleSwipeStart(e.touches[0].clientY);
    const handleTouchEnd = (e: React.TouchEvent) => handleSwipeEnd(e.changedTouches[0].clientY);
    const handleMouseDown = (e: React.MouseEvent) => handleSwipeStart(e.clientY);
    
    useEffect(() => {
        if (dragStartY === null) return;
    
        const handleMouseUp = (e: MouseEvent) => {
            handleSwipeEnd(e.clientY);
        };
    
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [dragStartY, expanded]);
    
    useEffect(() => {
        setHeight(expanded ? heights.expanded : heights.collapsed);
    }, [expanded, heights]);

    return (
        <>
            {/* Scrim */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-200"
                    onClick={() => setExpanded(false)}
                />
            )}

            {/* Invisible layout spacer */}
            <div className="sm:hidden"
                style={{ height: `${heights.collapsed}px` }}
            />

            {/* Expandable footer */}
            <footer
                className={clsx(
                    "sm:hidden",
                    "fixed z-40 bottom-2 left-4 right-4",
                    "rounded-2xl px-4 pb-4",
                    "touch-none select-none",
                    "bg-surface border-t border-bdr flex flex-col",
                    "transition-[height] duration-300"
                )}
                style={{ height: `${height}px` }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                
            >
                {/* Drag Handle */}
                <div
                    className="w-full flex justify-center items-center p-3 cursor-grab active:cursor-grabbing"
                    onClick={() => {setExpanded(prev => !prev), console.log(expanded)}}
                >
                    <div className="w-1/7 h-1 bg-surface-light rounded-full" />
                </div>

                {/* Collapsed Controls */}
                <div
                    className={clsx(
                        'h-full flex justify-center items-center gap-3 transition-all duration-100',
                        expanded
                            ? 'opacity-0 -translate-y-2 pointer-events-none'
                            : 'opacity-100 translate-y-0 pointer-events-auto'
                    )}
                >
                    <button
                        onClick={() => setExpanded(true)}
                        className="h-full flex-1 flex flex-col gap-2 items-center"
                    >
                        <div className="flex-1 w-full px-3 py-1 rounded-lg bg-surface-light border border-bdr flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-text-main text-center">{selectedAlgorithm}</div>
                            <span className="text-xs text-text-muted mt-1 text-center">Path Algorithm</span>
                        </div>
                        <div className="flex-1 w-full px-3 py-1  rounded-lg bg-surface-light border border-bdr flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-text-main text-center">{selectedMazeGen || 'Random'}</div>
                            <span className="text-xs text-text-muted mt-1 text-center">Maze Generation</span>
                        </div>
                    </button>

                    <button
                        onClick={onRun}
                        disabled={isAnimating}
                        className={clsx(
                            'px-3 py-4 text-3xl font-bold rounded-lg border-2 transition-all',
                            isAnimating
                                ? 'opacity-60 cursor-not-allowed text-text-muted border-bdr'
                                : 'border-primary text-primary hover:bg-primary hover:text-text-invert shadow-highlight'
                        )}
                    >
                        GO
                    </button>
                    <div className="flex-1 flex justify-center">
                        <button
                            onClick={onResetAlgorithmState}
                            disabled={isAnimating}
                            className={clsx(
                                'px-3 py-2 rounded-lg text-lg font-medium',
                                'bg-surface-light border border-bdr text-text-muted hover:bg-surface-highlight hover:text-text-main transition-all',
                                isAnimating && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            Reset
                        </button>
                    </div>
                    

                </div>

                {/* Expanded Controls */}
                <div
                    className={clsx(
                        'absolute inset-4 transition-all duration-100 flex flex-col gap-4',
                        expanded
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 translate-y-2 pointer-events-none'
                    )}
                >
                    <LabelControl label="Algorithm">
                        <Dropdown
                            options={ALGORITHM_OPTIONS}
                            value={selectedAlgorithm}
                            onChange={onAlgorithmChange}
                            disabled={isAnimating}
                        />
                    </LabelControl>
                    <LabelControl label="Maze Generation">
                        <Dropdown
                            options={MAZE_GEN_ALGOS}
                            value={selectedMazeGen || 'random'}
                            onChange={v => onMazeGenChange?.(v)}
                            disabled={isAnimating}
                        />
                    </LabelControl>
                    {/* Speed Selection */}
                    <LabelControl label="Speed">
                        <div className="flex gap-2">
                            {SPEED_OPTIONS.map((s, i) => (
                                <button
                                    key={s}
                                    onClick={() => onSpeedChange(s)}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'flex-1 py-1 rounded-md font-semibold transition-all border flex flex-col items-center gap-0.5 min-w-0',
                                        'text-xs',
                                        isAnimating && 'opacity-50 cursor-not-allowed',
                                        speed === s
                                            ? 'bg-primary text-text-invert border-primary shadow-highlight'
                                            : 'bg-surface-light text-text-main border-bdr hover:bg-surface-highlight'
                                    )}
                                    style={{ minWidth: 0 }}
                                >
                                    <span className="text-lg font-mono leading-none">{SPEED_SYMBOLS[i]}</span>
                                    <span className="text-[0.72rem] capitalize leading-none">{s}</span>
                                </button>
                            ))}
                        </div>
                    </LabelControl>

                    <LabelControl label="Reset Options" className="text-sm text-text-muted">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    onResetAll();
                                    setExpanded(false);
                                }}
                                disabled={isAnimating}
                                className={clsx(
                                    'px-2 py-1 rounded-md font-medium transition-all text-sm',
                                    'bg-surface-light border border-bdr text-text-main',
                                    'hover:text-text-main hover:bg-surface-highlight',
                                    isAnimating && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                Reset All
                            </button>
                            <button
                                onClick={() => {
                                    onResetAlgorithmState();
                                    setExpanded(false);
                                }}
                                disabled={isAnimating}
                                className={clsx(
                                    'px-2 py-1 rounded-md font-medium transition-all text-sm',
                                    'bg-surface-light border border-bdr text-text-main',
                                    'hover:text-text-main hover:bg-surface-highlight',
                                    isAnimating && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                Reset State
                            </button>
                            {onClearWalls && (
                                <button
                                    onClick={() => {
                                        onClearWalls();
                                        setExpanded(false);
                                    }}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-2 py-1 rounded-md font-medium transition-all col-span-2 text-sm',
                                        'bg-surface-light border border-bdr text-text-main',
                                        'hover:text-text-main hover:bg-surface-highlight',
                                        isAnimating && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    Clear Walls
                                </button>
                            )}
                        </div>
                    </LabelControl>
                </div>
            </footer>
        </>
    );
}