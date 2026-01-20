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
const EXPANDED_HEIGHT_VH = 70; // as vh of viewport

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
    const [currentHeight, setCurrentHeight] = useState<number>(100);
    const [collapsedHeight, setCollapsedHeight] = useState<number>(100);
    const footerRef = useRef<HTMLDivElement>(null);

    // Save collapsed height on mount or resize
    useEffect(() => {
        const updateCollapsedHeight = () => {
            if (footerRef.current) {
                const height = footerRef.current.getBoundingClientRect().height;
                setCollapsedHeight(height);
                if (!expanded) setCurrentHeight(height);
            }
        };
        updateCollapsedHeight();
        window.addEventListener('resize', updateCollapsedHeight);
        return () => window.removeEventListener('resize', updateCollapsedHeight);
    }, [expanded]);

    const handleSwipeStart = (clientY: number) => {
        setDragStartY(clientY);
    };

    const handleSwipeEnd = (clientY: number) => {
        if (dragStartY === null) return;

        const deltaY = dragStartY - clientY;
        const viewportHeight = window.innerHeight;
        const expandedHeightPx = (viewportHeight * EXPANDED_HEIGHT_VH) / 100;

        if (deltaY > SWIPE_THRESHOLD) { // swipe up => expand
            setExpanded(true);
            setCurrentHeight(expandedHeightPx);
        } else if (deltaY < -SWIPE_THRESHOLD) { // swipe down => collapse
            setExpanded(false);
            setCurrentHeight(collapsedHeight);
        } else { // Snap back
            setCurrentHeight(expanded ? expandedHeightPx : collapsedHeight);
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
    }, [dragStartY, collapsedHeight, expanded]);
    
    useEffect(() => {
        const viewportHeight = window.innerHeight;
        const expandedHeightPx = (viewportHeight * EXPANDED_HEIGHT_VH) / 100;
        setCurrentHeight(expanded ? expandedHeightPx : collapsedHeight);
    }, [expanded, collapsedHeight]);

    return (
        <>
            {/* Scrim */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300"
                    onClick={() => setExpanded(false)}
                />
            )}

            {/* Invisible layout spacer*/}
            <div className="sm:hidden h-1/6" ref={footerRef} />

            {/* Expandable footer */}
            <div
                className="sm:hidden fixed z-40 bottom-0 left-0 right-0 px-4 pb-3 touch-none select-none bg-surface flex flex-col transition-[height] duration-300"
                style={{ height: `${currentHeight}px` }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                
            >
                {/* Drag Handle */}
                <div
                    className="w-full flex justify-center items-center p-3 cursor-grab active:cursor-grabbing"
                    onClick={() => setExpanded(prev => !prev)}
                >
                    <div className="w-1/7 h-1 bg-surface-light rounded-full" />
                </div>


                <div className="relative">
                    {/* Collapsed Controls */}
                    <div
                        className={clsx(
                            'flex items-center gap-3 transition-all duration-200',
                            expanded
                                ? 'opacity-0 -translate-y-2 pointer-events-none'
                                : 'opacity-100 translate-y-0 pointer-events-auto'
                        )}
                    >
                        <button
                            onClick={() => setExpanded(true)}
                            className="px-3 py-2 rounded-lg bg-surface-light flex gap-2 items-center"
                        >
                            <span className="text-xs text-gray-400">Algo:</span>
                            <span>{selectedAlgorithm}</span>
                        </button>

                        <button
                            onClick={onResetAlgorithmState}
                            disabled={isAnimating}
                            className={clsx(
                                'px-3 py-2 rounded-lg text-sm font-medium',
                                'bg-gray-700 border border-gray-600 text-gray-300',
                                isAnimating && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            Reset
                        </button>

                        <button
                            onClick={onRun}
                            disabled={isAnimating}
                            className={clsx(
                                'px-2 py-1 text-lg font-bold rounded-lg border-2',
                                isAnimating
                                    ? 'opacity-50 cursor-not-allowed text-text-muted'
                                    : 'border-primary text-primary hover:bg-primary hover:text-text-invert'
                            )}
                        >
                            GO
                        </button>
                    </div>

                    {/* Expanded Controls */}
                    <div
                        className={clsx(
                            'absolute inset-0 transition-all duration-100',
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
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Speed</label>
                            <div className="flex gap-2">
                                {SPEED_OPTIONS.map((s, i) => (
                                    <button
                                        key={s}
                                        onClick={() => onSpeedChange(s)}
                                        disabled={isAnimating}
                                        className={clsx(
                                            'flex-1 py-4 rounded-lg font-bold transition-all border flex flex-col items-center gap-1',
                                            isAnimating && 'opacity-50 cursor-not-allowed',
                                            speed === s
                                                ? 'bg-cyan-400 text-gray-900 border-cyan-400 shadow-lg'
                                                : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                                        )}
                                    >
                                        <span className="text-2xl font-mono">{SPEED_SYMBOLS[i]}</span>
                                        <span className="text-xs capitalize">{s}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reset Actions */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Reset Options</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        onResetAll();
                                        setExpanded(false);
                                    }}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-4 py-3 rounded-lg font-medium transition-all',
                                        'bg-gray-700 border border-gray-600 text-gray-300',
                                        'hover:text-white hover:bg-gray-600',
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
                                        'px-4 py-3 rounded-lg font-medium transition-all',
                                        'bg-gray-700 border border-gray-600 text-gray-300',
                                        'hover:text-white hover:bg-gray-600',
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
                                            'px-4 py-3 rounded-lg font-medium transition-all col-span-2',
                                            'bg-gray-700 border border-gray-600 text-gray-300',
                                            'hover:text-white hover:bg-gray-600',
                                            isAnimating && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        Clear Walls
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}