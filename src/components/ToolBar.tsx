import React from 'react';
import clsx from 'clsx';
import Dropdown from './Dropdown';
import LabelControl from './LabelControl';
import { pathFindingAlgorithm, AnimationState, Speed } from '../types';

const MAZE_GEN_ALGOS = [
    'random',
    'recursive-division',
    'prim',
    'eller',
    'kruskal',
] as const;
type MazeGenAlgo = (typeof MAZE_GEN_ALGOS)[number];

export interface ToolBarProps {
    mapMode: boolean;
    animationState: AnimationState;
    selectedAlgorithm: pathFindingAlgorithm;
    selectedMazeGen?: MazeGenAlgo;
    speed: Speed;
    nodeSize: number;
    nodeMin: number;
    nodeMax: number;
    nodeStep: number;
    onRun: () => void;
    onReset: () => void;
    onAlgorithmChange: (algo: pathFindingAlgorithm) => void;
    onMazeGenChange?: (algo: MazeGenAlgo) => void;
    onSpeedChange: (s: Speed) => void;
    onNodeSizeChange: (size: number) => void;
    isDrawing?: boolean;
}

const ALGORITHM_OPTIONS: pathFindingAlgorithm[] = [
    'BFS',
    'DFS',
    'A*',
    'GBFS',
    'Dijkstra',
];

const SPEED_OPTIONS: Speed[] = ['slow', 'medium', 'fast'];
const SPEED_SYMBOLS = ['>', '>>', '>>>'];

export default function ToolBar({
    animationState,
    selectedAlgorithm,
    selectedMazeGen,
    speed,
    nodeSize,
    nodeMin,
    nodeMax,
    nodeStep,
    onRun,
    onReset,
    onAlgorithmChange,
    onMazeGenChange,
    onSpeedChange,
    onNodeSizeChange,
    isDrawing = false,
}: ToolBarProps) {
    const isAnimating = animationState !== 'idle';

    return (
        <div
            className={clsx(
                'w-full px-4 py-3 z-20 transition-opacity',
                'grid grid-cols-1 gap-4',
                'xs:grid-cols-3 xs:items-center',
                isDrawing ? 'opacity-60' : 'opacity-100'
            )}
        >
            {/* Left controls */}
            <div
                className={clsx(
                    'flex flex-1 items-center gap-3 flex-col',
                    'sm:flex-row sm:items-start sm:justify-start'
                )}
            >
                <LabelControl label="Algorithm" className="w-full">
                    <Dropdown
                        options={ALGORITHM_OPTIONS}
                        value={selectedAlgorithm}
                        onChange={onAlgorithmChange}
                        disabled={isAnimating}
                    />
                </LabelControl>
                <LabelControl label="Maze Generation" className="w-full">
                    <Dropdown
                        options={MAZE_GEN_ALGOS}
                        value={selectedMazeGen || 'random'}
                        onChange={v => onMazeGenChange?.(v)}
                        disabled={isAnimating}
                    />
                </LabelControl>
            </div>

            {/* Center - Run */}
            <div className="flex justify-center items-center transition-all order-first xs:order-0">
                <button
                    onClick={onRun}
                    disabled={isAnimating}
                    className={clsx(
                        'font-bold rounded-lg border-2 border-primary',
                        'text-primary hover:bg-primary hover:text-text-invert transition-all',
                        'py-2 text-lg w-3/5 min-w-fit max-w-3/5',
                        'xs:px-2 xs:py-4',
                        'sm:text-xl'
                    )}
                >
                    VISUALIZE
                </button>
            </div>

            {/* Right controls */}
            <div
                className={clsx(
                    'flex flex-1 items-center gap-3 flex-col',
                    'sm:flex-row sm:items-start sm:justify-end'
                )}
            >
                <LabelControl label="Speed">
                    <div className="w-full max-w-[170px] flex gap-1 items-center rounded-lg border border-bdr-muted">
                        {SPEED_OPTIONS.map((s, i) => (
                            <button
                                key={s}
                                onClick={() => onSpeedChange(s)}
                                className={clsx(
                                    'w-10 h-10 rounded-lg text-lg font-mono font-bold cursor-pointer transition-all',
                                    speed === s
                                        ? 'text-primary bg-surface-highlight shadow-lg scale-120'
                                        : 'text-text-muted hover:text-text-main'
                                )}
                            >
                                {SPEED_SYMBOLS[i]}
                            </button>
                        ))}
                    </div>
                </LabelControl>
                <LabelControl label={`Node Size: ${nodeSize}px`}>
                    <input
                        type="range"
                        min={nodeMin}
                        max={nodeMax}
                        step={nodeStep}
                        value={nodeSize}
                        onChange={e => onNodeSizeChange(Number(e.target.value))}
                        disabled={isAnimating}
                        className="w-full accent-primary"
                    />
                </LabelControl>
                <button
                    onClick={onReset}
                    disabled={isAnimating}
                    className={clsx(
                        'px-4 py-2 rounded-lg font-medium text-text-muted cursor-pointer',
                        isAnimating
                            ? 'opacity-50 cursor-not-allowed'
                            : 'border border-bdr hover:text-text-main hover:bg-surface-highlight'
                    )}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
