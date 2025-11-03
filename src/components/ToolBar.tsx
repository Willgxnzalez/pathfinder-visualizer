import React from "react";
import { Algorithm, AnimationState } from "../types";

interface ToolBarProps {
    mapMode: boolean;
    animationState: AnimationState;
    selectedAlgorithm: Algorithm;
    speed: "slow" | "medium" | "fast";

    onRun: () => void;
    onReset: () => void;
    onAlgorithmChange: (algo: Algorithm) => void;
    onSpeedChange: (s: "slow" | "medium" | "fast") => void;
}

export default function ToolBar({
    mapMode, 
    animationState,
    selectedAlgorithm,
    speed,
    onRun,
    onReset,
    onAlgorithmChange,
    onSpeedChange,
}: ToolBarProps) {
    const isAnimating = animationState !== "idle";

    const controlBoxClass =
        "min-w-[170px] h-10 flex items-center border transition-all bg-surface-2 border-border-main text-text-main" +
        (isAnimating ? " opacity-50 cursor-not-allowed" : "");
    const speedBtnClass = (active: boolean) =>
        "flex-1 h-full px-0 m-0 rounded-none border-none transition-all text-base font-medium outline-none " +
        (active
            ? "bg-accent text-white"
            : "bg-transparent text-text-muted hover:text-text-main");

    // Flex solution to center the middle button
    return (
        <div
            className="
                fixed glass top-15 left-1/2 -translate-x-1/2 px-12 py-3
                w-4/5
                flex items-center justify-center gap-12
                transition-all duration-300
                rounded-full
            "
        >
            {/* Left Side controls */}
            <div className="basis-2/5 flex flex-col gap-1 flex-1 min-w-0 items-start">
                <label className="text-sm text-text-muted">Algorithm</label>
                <select
                    value={selectedAlgorithm}
                    onChange={e => onAlgorithmChange(e.target.value as Algorithm)}
                    disabled={isAnimating}
                    className={"px-2 pe-1 appearance-none " + controlBoxClass}
                    style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                    }}
                >
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                    <option value="astar">A*</option>
                    <option value="gbfs">Greedy Best-First Search</option>
                    <option value="dijkstra">Dijkstra's</option>
                </select>
            </div>
            {/* Middle "Visualize" button centered */}
            <button
                onClick={onRun}
                disabled={isAnimating}
                className={
                    "basis-1/5 px-4 py-2 rounded-lg text-xl font-bold text-text-invert " +
                    (isAnimating
                        ? "bg-surface-3 cursor-not-allowed opacity-50"
                        : "bg-accent hover:brightness-110")
                }
                style={{ minWidth: 120, height: 40 }}
            >
                VISUALIZE
            </button>
            {/* Right side controls */}
            <div className="basis-2/5 flex gap-4 flex-1 min-w-0 justify-end">
                <button
                    onClick={onReset}
                    disabled={isAnimating}
                    className={
                        "btn " +
                        (isAnimating
                            ? "bg-surface-3 text-text-muted cursor-not-allowed"
                            : "bg-surface-3 text-text-main hover:bg-surface-4")
                    }
                    style={{ minWidth: 90, height: 40 }}
                >
                    Reset
                </button>
                {/* Speed Control */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-text-muted">Speed</label>
                    <div
                        className={controlBoxClass + " p-0"}
                        style={{ overflow: "hidden" }}
                    >
                        {(["slow", "medium", "fast"] as const).map((s, i, arr) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => onSpeedChange(s)}
                                className={
                                    speedBtnClass(speed === s) +
                                    (i === 0 ? " rounded-l" : "") +
                                    (i === arr.length - 1 ? " rounded-r" : "") +
                                    (speed === s ? " z-10" : "")
                                }
                                style={{
                                    borderLeft:
                                        i !== 0
                                            ? "1px solid var(--color-border-main)"
                                            : undefined,
                                    height: "100%",
                                    minWidth: 0,
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}