import React, { useState, useRef, useEffect } from "react";
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
        <div ref={ref} className="relative w-1/2">
            <label className="text-sm text-text-muted block mb-2">{label}</label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={clsx(
                    "w-full flex justify-between px-4 py-2 rounded-lg  text-text-main",
                    "border border-bdr-glass hover:bg-bg-2 transition-all",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
            >
                {value.toUpperCase()}
                <span aria-hidden>▼</span>
            </button>

            {open && (
    <div
        className={clsx(
            "absolute top-full left-0 mt-2 w-full rounded-lg z-30 overflow-hidden pointer-events-auto",
            "before:absolute before:inset-0 before:backdrop-blur-md before:-z-10 before:rounded-lg"
        )}
        style={{
            backgroundColor: "rgba(10, 10, 10, 0.4)",
            boxShadow: "0 5px 30px rgba(0,0,0, 0.25)",
            border: "1px solid rgba(80, 80, 110, 0.3)",
        }}
    >
        {options.map((opt) => (
            <button
                key={opt}
                onClick={() => {
                    onChange(opt);
                    setOpen(false);
                }}
                className={clsx(
                    "relative z-10 block w-full text-left px-4 py-2 text-text-main hover:bg-bg-2 pointer-events-auto",
                    opt === value && "font-semibold bg-bg-2"
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
                "px-4 py-2 text-sm font-medium",
                (speed === s)
                    ? "bg-bg-2 text-text-main "
                    : "bg-bg-glass text-text-muted hover:bg-bg-2",
            )}
        >
            {s}
        </button>
    );

    return (
        <div
            className={clsx(
                "w-full flex items-center justify-between gap-4 px-5 py-3 z-20 transition-opacity",
                isDrawing ? "opacity-60" : "opacity-100"
            )}
        >
            {/* Left - Dropdowns */}
            <div className="flex flex-1 gap-3">
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
                    "px-6 py-2 text-xl font-bold rounded-lg transition-all",
                    isAnimating
                        ? "bg-bg-2 opacity-50 cursor-not-allowed text-text-muted"
                        : "bg-secondary text-text-main"
                )}
            >
                VISUALIZE
            </button>

            {/* Right - Speed / Cell Size / Reset */}
            <div className="flex flex-1 items-center justify-end gap-3">
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-text-muted">Speed</label>
                    <div className="flex rounded-lg overflow-hidden border border-bdr-glass">
                        {(["slow", "medium", "fast"] as const).map(speedBtn)}
                    </div>
                </div>

                <div className="flex flex-col w-40">
                    <label className="text-sm text-text-muted">
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
                        className="accent-accent"
                    />
                </div>

                <button
                    onClick={onReset}
                    disabled={isAnimating}
                    className={clsx(
                        "px-4 py-2 rounded-md text-sm font-medium",
                        isAnimating
                            ? "bg-bg-2 opacity-50 cursor-not-allowed text-text-muted"
                            : "bg-bg-glass border border-bdr-glass text-text-main hover:bg-bg-2"
                    )}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
