import { AnimationState, Speed, PathAlgorithm } from '../types';
import React, { useState } from 'react';
import clsx from 'clsx';
import Dropdown from './Dropdown';
import LabelControl from './LabelControl';
import SettingsSidebar from './SettingsSidebar';
import { ChevronDownIcon, MapIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

export interface HeaderProps {
    // State & Mode
    mapMode: boolean;
    animationState: AnimationState;
    isDrawing?: boolean;

    // Algorithm Controls
    selectedAlgorithm: PathAlgorithm;
    selectedMazeGen?: MazeGenAlgo;
    speed: Speed;
    nodeSize: number;
    nodeMin: number;
    nodeMax: number;
    nodeStep: number;

    // Event Handlers
    onAlgorithmChange: (algo: PathAlgorithm) => void;
    onMazeGenChange?: (algo: MazeGenAlgo) => void;
    onSpeedChange: (s: Speed) => void;
    onNodeSizeChange: (size: number) => void;

    // Actions
    onRun: () => void;
    onResetAll: () => void;
    onResetAlgorithmState: () => void;
    onClearWalls?: () => void;

    // Toggles
    onDarkModeToggle: () => void;
    onMapModeToggle: () => void;
}

const MAZE_GEN_ALGOS = [
    'Random',
    'Recursive-division',
    'Prim',
    'Eller',
    'Kruskal',
] as const;

type MazeGenAlgo = (typeof MAZE_GEN_ALGOS)[number];

const ALGORITHM_OPTIONS: PathAlgorithm[] = [
    'BFS',
    'DFS',
    'A*',
    'GBFS',
    'Dijkstra',
];

const SPEED_OPTIONS: Speed[] = ['slow', 'medium', 'fast'];

/* ---------- props ---------- */

export interface HeaderProps {
    mapMode: boolean;
    animationState: AnimationState;
    selectedAlgorithm: PathAlgorithm;
    selectedMazeGen?: MazeGenAlgo;
    speed: Speed;

    nodeSize: number;
    nodeMin: number;
    nodeMax: number;
    nodeStep: number;

    isDrawing?: boolean;

    onRun: () => void;
    onResetAll: () => void;
    onResetAlgorithmState: () => void;
    onClearWalls?: () => void;
    onAlgorithmChange: (algo: PathAlgorithm) => void;
    onMazeGenChange?: (algo: MazeGenAlgo) => void;
    onSpeedChange: (s: Speed) => void;
    onNodeSizeChange: (size: number) => void;

    onDarkModeToggle: () => void;
    onMapModeToggle: () => void;
}

export default function Header(props: HeaderProps) {
    const {
        animationState,
        selectedAlgorithm,
        selectedMazeGen,
        speed,
        nodeSize,
        nodeMin,
        nodeMax,
        nodeStep,
        isDrawing = false,

        onRun,
        onResetAll,
        onResetAlgorithmState,
        onClearWalls,
        onAlgorithmChange,
        onMazeGenChange,
        onSpeedChange,
        onNodeSizeChange,

        onDarkModeToggle,
        onMapModeToggle,
    } = props;

    const isAnimating = animationState !== 'idle';

    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <header className="w-full flex flex-col bg-surface select-none shadow border-b border-bdr">
            <div className="flex justify-between items-center px-3 py-2">
                <div className='flex gap-1'>
                    
                    
                    <h1 className="sm:text-xl font-bold text-text-main">
                        PathFinding Visualizer
                    </h1>
                </div>
                

                <div className="flex gap-1">
                    <button
                        onClick={() => onMapModeToggle()}
                        disabled={isAnimating}
                        className={clsx(
                            'p-2 cursor-pointer transition-all',
                            isAnimating && 'opacity-60 cursor-not-allowed'
                        )}
                    >
                        <MapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted" />
                    </button>
                    <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        disabled={isAnimating}
                        className={clsx(
                            'p-2 cursor-pointer transition-all',
                            isAnimating && 'opacity-60 cursor-not-allowed'
                        )}
                    >
                        <Cog6ToothIcon className="w-6 h-6 text-text-muted" />
                    </button>
                </div>
            </div>

            {/* ---------- Toolbar ---------- */}
            <div
                className={clsx(
                    'hidden sm:flex w-full transition-opacity relative bg-surface  border-t border-bdr',
                    isDrawing ? 'opacity-60' : 'opacity-100'
                )}
            >
                {/* Tablet View (640px - 1024px) */}
                <div className="hidden sm:flex lg:hidden w-full px-4 py-2 items-center gap-4">
                    {/* Left Controls (Stacked) */}
                    <div className="flex flex-1 flex-col gap-2">
                        <LabelControl label="Algorithm" className="w-3/4">
                            <Dropdown
                                options={ALGORITHM_OPTIONS}
                                value={selectedAlgorithm}
                                onChange={onAlgorithmChange}
                                disabled={isAnimating}
                            />
                        </LabelControl>
                        <LabelControl label="Maze Generation" className="w-3/4">
                            <Dropdown
                                options={MAZE_GEN_ALGOS}
                                value={selectedMazeGen || 'Random'}
                                onChange={v => onMazeGenChange?.(v)}
                                disabled={isAnimating}
                            />
                        </LabelControl>
                    </div>

                    {/* Visualize*/}
                    <button
                        onClick={onRun}
                        disabled={isAnimating}
                        className={clsx(
                            'min-w-fit shrink-0 w-1/8 px-5 py-3 text-xl font-bold rounded-lg transition-all whitespace-nowrap',
                            isAnimating
                                ? 'cursor-not-allowed opacity-50 text-text-muted'
                                : 'cursor-pointer text-primary border-2 border-primary hover:bg-primary hover:text-text-invert'
                        )}
                    >
                        VISUALIZE
                    </button>

                    {/* Right Controls */}
                    <div className="h-full flex flex-1 flex-col justify-between items-center gap-3">
                        <LabelControl label="Speed">
                            <div className="flex items-center rounded-lg border border-bdr overflow-hidden">
                                {SPEED_OPTIONS.map((s, i) => (
                                    <button
                                        key={s}
                                        onClick={() => onSpeedChange(s)}
                                        className={clsx(
                                            'w-10 flex-1 rounded-none first:rounded-l-lg last:rounded-r-lg p-2 font-medium text-center transition-all cursor-pointer',
                                            speed === s
                                                ? 'text-text-main bg-surface-light'
                                                : 'text-text-muted hover:text-text-main'
                                        )}
                                        style={{ minWidth: "5rem" }}
                                    >
                                        {SPEED_OPTIONS[i]}
                                    </button>
                                ))}
                            </div>
                        </LabelControl>
                        <LabelControl label="Reset">
                            <div className="flex gap-2">
                                <button
                                    onClick={onResetAll}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm font-medium bg-surface-light text-red-800 hover:text-main hover:bg-surface-highlight rounded-lg border border-bdr whitespace-nowrap cursor-pointer',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    All
                                </button>
                                <button
                                    onClick={onResetAlgorithmState}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm font-medium bg-surface-light text-text-muted hover:text-main hover:bg-surface-highlight rounded-lg border border-bdr whitespace-nowrap cursor-pointer',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Path
                                </button>
                                <button
                                    onClick={onClearWalls}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm font-medium bg-surface-light text-text-muted hover:text-main hover:bg-surface-highlight rounded-lg border border-bdr whitespace-nowrap cursor-pointer',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Walls
                                </button>
                            </div>
                        </LabelControl>
                    </div>
                </div>

                {/* Desktop View (>= 1024px) */}
                <div className="hidden lg:flex w-full px-8 py-2 items-center justify-between gap-4 relative">
                    {/* Left Controls */}
                    <div className="flex flex-1 justify-start items-center gap-8">
                        <LabelControl label="Algorithm" className="flex-1 max-w-1/3">
                            <Dropdown
                                options={ALGORITHM_OPTIONS}
                                value={selectedAlgorithm}
                                onChange={onAlgorithmChange}
                                disabled={isAnimating}
                            />
                        </LabelControl>
                        <LabelControl label="Maze Generation" className="flex-1 max-w-1/3">
                            <Dropdown
                                options={MAZE_GEN_ALGOS}
                                value={selectedMazeGen || 'Random'}
                                onChange={v => onMazeGenChange?.(v)}
                                disabled={isAnimating}
                            />
                        </LabelControl>
                    </div>

                    {/* Visualize*/}
                    <button
                        onClick={onRun}
                        disabled={isAnimating}
                        className={clsx(
                            'min-w-fit shrink-0 w-1/8 px-5 py-3 text-xl font-bold rounded-lg transition-all whitespace-nowrap',
                            isAnimating
                                ? 'cursor-not-allowed opacity-50 text-text-muted'
                                : 'cursor-pointer text-primary border-2 border-primary hover:bg-primary hover:text-text-invert'
                        )}
                    >
                        VISUALIZE
                    </button>

                    {/* Right Controls */}
                    <div className="flex flex-1 justify-end items-center gap-8">
                        <LabelControl label="Speed">
                            <div className="flex items-center rounded-lg border border-bdr overflow-hidden">
                                {SPEED_OPTIONS.map((s, i) => (
                                    <button
                                        key={s}
                                        onClick={() => onSpeedChange(s)}
                                        className={clsx(
                                            'w-10 flex-1 rounded-none first:rounded-l-lg last:rounded-r-lg p-2 font-medium text-center transition-all cursor-pointer',
                                            speed === s
                                                ? 'text-text-main bg-surface-light'
                                                : 'text-text-muted hover:text-text-main'
                                        )}
                                        style={{ minWidth: "5rem" }}
                                    >
                                        {SPEED_OPTIONS[i]}
                                    </button>
                                ))}
                            </div>
                        </LabelControl>
                        <LabelControl label="Reset">
                            <div className="flex gap-2">
                                <button
                                    onClick={onResetAll}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm font-medium bg-surface-light text-red-800 hover:text-main hover:bg-surface-highlight rounded-lg border border-bdr whitespace-nowrap cursor-pointer',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    All
                                </button>
                                <button
                                    onClick={onResetAlgorithmState}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm font-medium bg-surface-light text-text-muted hover:text-main hover:bg-surface-highlight rounded-lg border border-bdr whitespace-nowrap cursor-pointer',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Path
                                </button>
                                <button
                                    onClick={onClearWalls}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm font-medium bg-surface-light text-text-muted hover:text-main hover:bg-surface-highlight rounded-lg border border-bdr whitespace-nowrap cursor-pointer',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Walls
                                </button>
                            </div>
                        </LabelControl>
                    </div>
                </div>
            </div>

            {/* ---------- Settings Sidebar ---------- */}
            <SettingsSidebar
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                nodeSize={nodeSize}
                nodeMin={nodeMin}
                nodeMax={nodeMax}
                nodeStep={nodeStep}
                onNodeSizeChange={onNodeSizeChange}
            />
        </header>
    );
}