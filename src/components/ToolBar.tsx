import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Algorithm, AnimationState } from "../types";
import clsx from "clsx";

const MAZE_GEN_ALGOS = ["random", "recursive-division", "prim", "eller", "kruskal"] as const;
type MazeGenAlgo = typeof MAZE_GEN_ALGOS[number];

export interface ToolBarProps {
    mapMode: boolean;
    animationState: AnimationState;
    selectedAlgorithm: Algorithm;
    selectedMazeGen?: MazeGenAlgo;
    speed: "slow" | "medium" | "fast";
    cellSize: number;
    cellMin: number;
    cellMax: number;
    cellStep: number;
    onRun: () => void;
    onReset: () => void;
    onAlgorithmChange: (algo: Algorithm) => void;
    onMazeGenChange?: (algo: MazeGenAlgo) => void;
    onSpeedChange: (s: "slow" | "medium" | "fast") => void;
    onCellSizeChange: (size: number) => void;
    isDrawing?: boolean;
}

/* -------------------- Reusable Dropdown -------------------- */
function Dropdown<T extends string>({
    label,
    options,
    value,
    onChange,
    disabled,
}: {
    label: string;
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div ref={ref} className="relative w-1/3">
            <label className="text-sm text-text-muted block mb-2">{label}</label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={clsx(
                    "w-full flex justify-between px-3 py-2 rounded-lg",
                    "appearance-none font-medium",
                    "text-text-main",
                    "border border-bdr",
                    "cursor-pointer",
                    "bg-surface-light",
                    "hover:bg-surface-highlight",
                    "transition-all",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
            >
                {value.toUpperCase()}
                <ChevronDownIcon className="size-5"/>
            </button>

            {open && (
                <div
                    className={clsx(
                        "absolute top-full left-0 mt-5 w-full z-20 overflow-hidden",
                        "rounded-lg bg-surface border border-bdr shadow"
                    )}
                    onMouseLeave={() => setOpen(false)}
                >
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className={clsx(
                                "relative block w-full px-4 py-2 text-left pointer-events-auto cursor-pointer z-10",
                                "text-text-main hover:bg-surface-highlight",
                                opt === value && "font-semibold bg-surface-light"
                            )}
                        >
                            {opt.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* -------------------- Toolbar -------------------- */
export default function ToolBar({
    animationState,
    selectedAlgorithm,
    selectedMazeGen,
    speed,
    cellSize,
    cellMin,
    cellMax,
    cellStep,
    onRun,
    onReset,
    onAlgorithmChange,
    onMazeGenChange,
    onSpeedChange,
    onCellSizeChange,
    isDrawing = false,
}: ToolBarProps) {
    const isAnimating = animationState !== "idle";

    const speedBtn = (s: "slow" | "medium" | "fast") => (
        <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={clsx(
                "px-3 py-2 text-sm font-medium",
                (speed === s)
                    ? "text-text-main bg-surface-light"
                    : "text-text-muted hover:bg-surface-light"
            )}
        >
            {s}
        </button>
    );

    return (
        <div
            className={clsx(
                "w-full flex items-center justify-between gap-4 px-5 py-3 z-20",
                "transition-opacity",
                isDrawing ? "opacity-60" : "opacity-100"
            )}
        >
            {/* Left controls */}
            <div className="flex flex-1 items-center justify-start gap-3 flex-wrap">
                <Dropdown
                    label="Algorithm"
                    options={["bfs", "dfs", "astar", "gbfs", "dijkstra"] as const}
                    value={selectedAlgorithm}
                    onChange={onAlgorithmChange}
                    disabled={isAnimating}
                />
                <Dropdown
                    label="Maze Generation"
                    options={MAZE_GEN_ALGOS}
                    value={selectedMazeGen || "random"}
                    onChange={(v) => onMazeGenChange?.(v)}
                    disabled={isAnimating}
                />
            </div>

            {/* Center - Run */}
            <button
                onClick={onRun}
                disabled={isAnimating}
                className={clsx(
                    "px-6 py-4 text-xl font-bold rounded-lg transition-all appearance-none cursor-pointer",
                    isAnimating
                        ? "opacity-50 cursor-not-allowed text-text-muted"
                        : "text-primary border border-primary hover:bg-secondary hover:border-secondary"
                )}
            >
                VISUALIZE
            </button>

            {/* Right controls */}
            <div className="flex flex-1 items-center justify-around gap-3 flex-wrap">
                <div className="flex flex-col">
                    <label className="text-sm text-text-muted mb-2">Speed</label>
                    <div className="flex rounded-lg overflow-hidden border border-bdr">
                        {(["slow", "medium", "fast"] as const).map((s: "slow" | "medium" | "fast") => (
                            <button
                                key={s}
                                onClick={() => onSpeedChange(s)}
                                className={clsx(
                                    "px-3 py-2 font-medium hover:bg-surface-highlight cursor-pointer",
                                    (speed === s)
                                        ? "text-text-main bg-surface-light"
                                        : "text-text-muted "
                                )}
                            >
                                {s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-text-muted mb-2">
                        Cell Size: <span className="text-text-main">{cellSize}px</span>
                    </label>
                    <input
                        type="range"
                        min={cellMin}
                        max={cellMax}
                        step={cellStep}
                        value={cellSize}
                        onChange={(e) => onCellSizeChange(Number(e.target.value))}
                        disabled={isAnimating}
                        className="accent-primary"
                    />
                </div>
                <button
                    onClick={onReset}
                    disabled={isAnimating}
                    className={clsx(
                        "px-4 py-2 rounded-lg font-medium text-text-muted cursor-pointer",
                        isAnimating
                            ? "opacity-50 cursor-not-allowed "
                            : "border border-bdr hover:text-text-main hover:bg-surface-highlight"
                    )}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
