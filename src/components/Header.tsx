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
    'random',
    'recursive-division',
    'prim',
    'eller',
    'kruskal',
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

    const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
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
                <div className="hidden sm:flex lg:hidden w-full px-4 py-3 items-end justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex items-center gap-3">
                        {/* Left Controls (Stacked) */}
                        <div className="flex flex-col gap-2 w-48">
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
                        </div>
                    </div>

                    {/* Center - Visualize (Absolute center) */}
                    <button
                        onClick={onRun}
                        disabled={isAnimating}
                        className={clsx(
                            'absolute left-1/2 -translate-x-1/2 px-6 py-3 text-xl font-bold rounded-lg transition-all whitespace-nowrap',
                            isAnimating
                                ? 'cursor-not-allowed opacity-50 text-text-muted'
                                : 'cursor-pointer text-primary border-2 border-primary hover:bg-primary hover:text-text-invert'
                        )}
                    >
                        VISUALIZE
                    </button>

                    {/* Right Controls */}
                    <div className="flex flex-col gap-2 items-end">
                        <LabelControl label="Speed">
                            <div className="flex gap-1 items-center rounded-lg border border-bdr-muted p-1">
                                {SPEED_OPTIONS.map((s, i) => (
                                    <button
                                        key={s}
                                        onClick={() => onSpeedChange(s)}
                                        className={clsx(
                                            'w-10 h-10 rounded-lg text-lg font-mono font-bold transition-all cursor-pointer',
                                            speed === s
                                                ? 'text-primary bg-surface-highlight shadow-lg scale-110'
                                                : 'text-text-muted hover:text-text-main'
                                        )}
                                    >
                                        {SPEED_OPTIONS[i]}
                                    </button>
                                ))}
                            </div>
                        </LabelControl>
                        <div className="flex rounded-lg border border-bdr overflow-hidden">
                            <button
                                onClick={onResetAll}
                                disabled={isAnimating}
                                className={clsx(
                                    'px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight border-r border-bdr whitespace-nowrap',
                                    isAnimating && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                Reset All
                            </button>
                            <button
                                onClick={onResetAlgorithmState}
                                disabled={isAnimating}
                                className={clsx(
                                    'px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight border-r border-bdr whitespace-nowrap',
                                    isAnimating && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                Reset State
                            </button>
                            {onClearWalls && (
                                <button
                                    onClick={onClearWalls}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight whitespace-nowrap',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Clear Walls
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop View (>= 1024px) */}
                <div className="hidden lg:flex w-full px-4 py-3 items-end justify-between gap-4 relative">
                    {/* Left Side */}
                    <div className="flex items-end gap-3">
                        <div className="flex gap-3 items-end">
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
                        </div>
                    </div>

                    {/* Center - Visualize (Absolute center) */}
                    <button
                        onClick={onRun}
                        disabled={isAnimating}
                        className={clsx(
                            'absolute left-1/2 -translate-x-1/2 px-6 py-3 text-xl font-bold rounded-lg transition-all whitespace-nowrap',
                            isAnimating
                                ? 'cursor-not-allowed opacity-50 text-text-muted'
                                : 'cursor-pointer text-primary border-2 border-primary hover:bg-primary hover:text-text-invert'
                        )}
                    >
                        VISUALIZE
                    </button>

                    {/* Right Controls */}
                    <div className="flex gap-3 items-end">
                        <LabelControl label="Speed">
                            <div className="flex gap-1 items-center rounded-lg border border-bdr-muted p-1">
                                {SPEED_OPTIONS.map((s, i) => (
                                    <button
                                        key={s}
                                        onClick={() => onSpeedChange(s)}
                                        className={clsx(
                                            'w-10 h-10 rounded-lg text-lg font-mono font-bold transition-all cursor-pointer',
                                            speed === s
                                                ? 'text-primary bg-surface-highlight shadow-lg scale-110'
                                                : 'text-text-muted hover:text-text-main'
                                        )}
                                    >
                                        {SPEED_OPTIONS[i]}
                                    </button>
                                ))}
                            </div>
                        </LabelControl>
                        <div className="flex rounded-lg border border-bdr overflow-hidden">
                            <button
                                onClick={onResetAll}
                                disabled={isAnimating}
                                className={clsx(
                                    'px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight border-r border-bdr whitespace-nowrap',
                                    isAnimating && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                Reset All
                            </button>
                            <button
                                onClick={onResetAlgorithmState}
                                disabled={isAnimating}
                                className={clsx(
                                    'px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight border-r border-bdr whitespace-nowrap',
                                    isAnimating && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                Reset State
                            </button>
                            {onClearWalls && (
                                <button
                                    onClick={onClearWalls}
                                    disabled={isAnimating}
                                    className={clsx(
                                        'px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight whitespace-nowrap',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Clear Walls
                                </button>
                            )}
                        </div>
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