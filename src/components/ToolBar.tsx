import React, { useState } from 'react';
import clsx from 'clsx';
import Dropdown from './Dropdown';
import LabelControl from './LabelControl';
import SettingsSidebar from './SettingsSidebar';
import { pathFindingAlgorithm, AnimationState, Speed } from '../types';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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
    onResetAll: () => void;
    onResetAlgorithmState: () => void;
    onClearWalls?: () => void;
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

const HamburgerIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

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
    onResetAll,
    onResetAlgorithmState,
    onClearWalls,
    onAlgorithmChange,
    onMazeGenChange,
    onSpeedChange,
    onNodeSizeChange,
    isDrawing = false,
}: ToolBarProps) {
    const isAnimating = animationState !== 'idle';
    const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <div
                className={clsx(
                    'w-full transition-opacity relative',
                    'bg-surface border-b border-bdr',
                    isDrawing ? 'opacity-60' : 'opacity-100'
                )}
            >
                {/* Mobile View Toolbar (< 640px) */}
                <div className="sm:hidden w-full px-4 py-3 flex items-center relative">
                    {/* Hamburger Menu (Left) */}
                    <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        disabled={isAnimating}
                        className={clsx(
                            'p-2 rounded-lg border border-bdr bg-surface-light hover:bg-surface-highlight transition-all',
                            isAnimating && 'opacity-60 cursor-not-allowed'
                        )}
                    >
                        <HamburgerIcon className="w-6 h-6 text-text-muted" />
                    </button>

                    {/* Visualize Button (Centered - using absolute positioning for true center) */}
                    <button
                        onClick={onRun}
                        disabled={isAnimating}
                        className={clsx(
                            'absolute left-1/2 -translate-x-1/2 px-6 py-2 text-lg font-bold rounded-lg transition-all',
                            isAnimating
                                ? 'cursor-not-allowed opacity-50 text-text-muted'
                                : 'cursor-pointer text-primary border-2 border-primary hover:bg-primary hover:text-text-invert'
                        )}
                    >
                        VISUALIZE
                    </button>
                </div>

                {/* Tablet View (640px - 1024px) */}
                <div className="hidden sm:flex lg:hidden w-full px-4 py-3 items-end justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu */}
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            disabled={isAnimating}
                            className={clsx(
                                'p-2 rounded-lg border border-bdr bg-surface-light hover:bg-surface-highlight transition-all',
                                isAnimating && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            <HamburgerIcon className="w-5 h-5 text-text-muted" />
                        </button>

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
                                        {SPEED_SYMBOLS[i]}
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
                        {/* Hamburger Menu */}
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            disabled={isAnimating}
                            className={clsx(
                                'p-2 rounded-lg border border-bdr bg-surface-light hover:bg-surface-highlight transition-all',
                                isAnimating && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            <HamburgerIcon className="w-5 h-5 text-text-muted" />
                        </button>

                        {/* Left Controls (Horizontal) */}
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
                                        {SPEED_SYMBOLS[i]}
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

                {/* Mobile Controls Bar (Below toolbar, expandable, overlay) */}
                <div
                    className={clsx(
                        'sm:hidden absolute left-0 top-full w-full bg-surface border-t border-bdr shadow-lg',
                        'overflow-hidden transition-all duration-300 z-30 pointer-events-auto',
                        mobileControlsOpen ? 'max-h-[70vh]' : 'max-h-0'
                    )}
                >
                    <div className="p-4 flex flex-col gap-4">
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
                                        {SPEED_SYMBOLS[i]}
                                    </button>
                                ))}
                            </div>
                        </LabelControl>
                        <div className="flex rounded-lg border border-bdr overflow-hidden">
                            <button
                                onClick={onResetAll}
                                disabled={isAnimating}
                                className={clsx(
                                    'flex-1 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight border-r border-bdr',
                                    isAnimating && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                Reset All
                            </button>
                            <button
                                onClick={onResetAlgorithmState}
                                disabled={isAnimating}
                                className={clsx(
                                    'flex-1 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight border-r border-bdr',
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
                                        'flex-1 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface-highlight',
                                        isAnimating && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    Clear Walls
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Controls Toggle Button*/}
                <button
                    onClick={() => setMobileControlsOpen(!mobileControlsOpen)}
                    disabled={isAnimating}
                    className={clsx(
                        'sm:hidden w-full py-2 flex items-center justify-center gap-2',
                        'bg-surface border-t border-bdr hover:bg-surface-highlight transition-all',
                        'text-sm font-medium text-text-muted',
                        isAnimating && 'opacity-60 cursor-not-allowed'
                    )}
                >
                    <span>Controls</span>
                    <ChevronDownIcon
                        className={clsx(
                            'w-4 h-4 transition-transform duration-300',
                            mobileControlsOpen && 'rotate-180'
                        )}
                    />
                </button>
            </div>

            {/* Settings Sidebar (Left Slide-in) */}
            <SettingsSidebar
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                nodeSize={nodeSize}
                nodeMin={nodeMin}
                nodeMax={nodeMax}
                nodeStep={nodeStep}
                onNodeSizeChange={onNodeSizeChange}
            />
        </>
    );
}
