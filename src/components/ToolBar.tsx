import React from "react";
import { Algorithm, AnimationState } from "../types";
import clsx from "clsx";

interface ToolBarProps {
    mapMode: boolean;
    animationState: AnimationState;
    selectedAlgorithm: Algorithm;
    speed: "slow" | "medium" | "fast";
    cellSize: number;
    cellMin: number;
    cellMax: number;
    cellStep: number;

    onRun: () => void;
    onReset: () => void;
    onAlgorithmChange: (algo: Algorithm) => void;
    onSpeedChange: (s: "slow" | "medium" | "fast") => void;
    onCellSizeChange: (size: number) => void;
}

export default function ToolBar({
    mapMode,
    animationState,
    selectedAlgorithm,
    speed,
    cellSize,
    cellMin,
    cellMax,
    cellStep,
    onRun,
    onReset,
    onAlgorithmChange,
    onSpeedChange,
    onCellSizeChange,
}: ToolBarProps) {
    const isAnimating = animationState !== "idle";

    const controlBoxClass = "min-w-[120px] h-8 bg-transparent flex items-center border transition-all border-bdr text-text-main" +
        (isAnimating ? " opacity-50 cursor-not-allowed" : "");
    const speedBtnClass = (active: boolean) =>
        "flex-1 h-full px-0 m-0 rounded border-none transition-all text-base font-medium outline-none " +
        (active
            ? "bg-accent text-white"
            : "bg-transparent text-text-muted hover:text-text-main");

    return (
        <div
            className={
                clsx(
                    "fixed glass top-25 left-1/2 -translate-x-1/2 px-4 py-2",
                    "w-[95vw]",
                    "flex gap-5",
                    "transition-all duration-300",
                    "rounded-xl",
                    "z-20"
                )
            }
        >
            {/* Left Side controls */}
            <div className="flex flex-col gap-1 min-w-0 justify-start flex-1">
                <label className="text-sm text-text-muted">Algorithm</label>
                <select
                    value={selectedAlgorithm}
                    onChange={e => onAlgorithmChange(e.target.value as Algorithm)}
                    disabled={isAnimating}
                    className={
                        "px-2 pe-1 appearance-none w-full " + controlBoxClass
                        + " min-w-[64px] max-w-full"
                    }
                >
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                    <option value="astar">A*</option>
                    <option value="gbfs">Greedy Best-First Search</option>
                    <option value="dijkstra">Dijkstra's</option>
                </select>
            </div>
            {/* Middle "Visualize" button always centered */}
            <div className="flex flex-col items-center min-w-0 justify-center">
                <button
                    onClick={onRun}
                    disabled={isAnimating}
                    className={
                        "px-6 py-2 rounded-lg text-xl font-bold text-text-invert transition-all w-full min-w-[96px] max-w-[180px] h-10 shrink-0 grow-0 " +
                        (isAnimating
                            ? "bg-surface-3 cursor-not-allowed opacity-50"
                            : "bg-accent hover:brightness-110")
                    }
                >
                    VISUALIZE
                </button>
            </div>
            {/* Right side controls grow and shrink */}
            <div
                className="flex gap-2 flex-wrap items-stretch justify-end flex-1"
            >
                <button
                    onClick={onReset}
                    disabled={isAnimating}
                    className={
                        "btn shrink-0 grow-0 min-w-[65px] h-10 max-w-[120px] " +
                        (isAnimating
                            ? "bg-surface-3 text-text-muted cursor-not-allowed"
                            : "bg-surface-3 text-text-main hover:bg-surface-4")
                    }
                >
                    Reset
                </button>
                {/* Speed Control */}
                <div className="flex flex-col gap-1 min-w-[90px] max-w-[160px] grow shrink rounded-sm">
                    <label className="text-sm text-text-muted whitespace-nowrap">Speed</label>
                    <div
                        className={controlBoxClass + " p-0 w-full overflow-hidden"}
                    >
                        {(["slow", "medium", "fast"] as const).map((s, i, arr) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => onSpeedChange(s)}
                                className={speedBtnClass(speed === s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Cell Size Control */}
                <div className="flex flex-col gap-1 min-w-[120px] max-w-[180px] grow shrink">
                    <label className="text-sm text-text-muted whitespace-nowrap">
                        Cell size: <span className="font-mono text-text-main">{cellSize} px</span>
                    </label>
                    <input
                        type="range"
                        min={cellMin}
                        max={cellMax}
                        step={cellStep}
                        value={cellSize}
                        onChange={(e) => onCellSizeChange(Number(e.target.value))}
                        disabled={isAnimating}
                        className={"accent-accent w-full h-10 " + (isAnimating ? "opacity-50 cursor-not-allowed" : "")}
                    />
                </div>
            </div>
        </div>
    );
}