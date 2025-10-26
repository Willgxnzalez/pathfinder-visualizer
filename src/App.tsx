import React, { useState, useRef, useEffect, useCallback } from "react";
import BFS from "./algorithms/pathfinding/BFS";
import DFS from "./algorithms/pathfinding/DFS";
import Astar from "./algorithms/pathfinding/Astar";
import GBFS from "./algorithms/pathfinding/GBFS";
import Dijkstra from "./algorithms/pathfinding/Dijkstra";
import Grid from "./models/Grid";
import GridView from "./components/grid/GridView";
import { AnimationState, AnimationStep, PathfindingResult, Algorithm } from "./types";
import { GRID_ROWS, GRID_COLS, CELL_SIZE } from "./utils/constants";

export default function App() {
    // Grid state
    const [grid, setGrid] = useState<Grid | null>(null);

    // Animation state
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const animationStateRef = useRef(animationState);
    useEffect(() => { animationStateRef.current = animationState; }, [animationState]);

    // Animation controls
    const generatorRef = useRef<Generator<AnimationStep, PathfindingResult, unknown> | null>(null);
    const pauseResolveRef = useRef<(() => void) | null>(null);
    const stepResolveRef = useRef<(() => void) | null>(null);

    // Speed control
    const [speed, setSpeed] = useState<"slow" | "medium" | "fast">("medium");
    const speedRef = useRef(speed);
    useEffect(() => { speedRef.current = speed; }, [speed]);

    // Algorithm selection
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("bfs");

    const [result, setResult] = useState("");

    const getDelay = (s: "slow" | "medium" | "fast"): number => {
        return ({ slow: 75, medium: 40, fast: 0 })[s];
    }
    const getAlgorithm = (algorithm: Algorithm) => {
        const algoMap = { bfs: BFS, dfs: DFS, astar: Astar, gbfs: GBFS, dijkstra: Dijkstra };
        return algoMap[algorithm] ?? BFS;
    };

    const waitForNextStep = async (delay: number): Promise<boolean> => {
        const state = animationStateRef.current;

        if (state === "stepping") {
            await new Promise<void>((r) => (stepResolveRef.current = r));
            return animationStateRef.current !== "idle";
        }
    
        await new Promise((r) => setTimeout(r, delay));

        if (animationStateRef.current === "paused") {
            await new Promise<void>((r) => (pauseResolveRef.current = r));
        }
        
        return animationStateRef.current !== "idle";
    };

    const renderStep = async (step: AnimationStep, grid: Grid, delay: number) => {
        if (step.type === "visit") {
            for (const node of step.nodes) {
                grid.setNodeVisited(node);
            }
        } else if (step.type === "path") {
            await new Promise((r) => setTimeout(r, delay * 10));
            for (const node of step.nodes) {
                grid.setNodePath(node);
                await new Promise((r) => setTimeout(r, 10));
            }
        }
    };

    const runVisualization = useCallback(async () => {
        if (!grid) return;

        grid.clearGrid(false);

        setResult("");
        setAnimationState("running");

        const algorithm = getAlgorithm(selectedAlgorithm);
        generatorRef.current = algorithm(grid);

        let delay = getDelay(speedRef.current);

        let result = generatorRef.current.next();
        while (!result.done) {
            await renderStep(result.value, grid, delay);
            const shouldContinue = await waitForNextStep(delay);
            if (!shouldContinue) {
                setResult("Stopped");
                setAnimationState("idle");
                generatorRef.current = null;
                return;
            }
            
            delay = getDelay(speedRef.current);
            result = generatorRef.current.next();
        }

        const finalResult = result.value;
        setAnimationState("idle");
        generatorRef.current = null;

        setResult(
            finalResult.found
                ? `Path found! Length: ${finalResult.pathLength}, Nodes visited: ${finalResult.nodesVisited}`
                : `No path found. Nodes visited: ${finalResult.nodesVisited}`
        );
    }, [selectedAlgorithm, grid]);

    const handlePause = useCallback(() => {
        if (animationStateRef.current === "running") setAnimationState("paused");
    }, []);

    const handleResume = useCallback(() => {
        if (["paused", "stepping"].includes(animationStateRef.current)) {
            setAnimationState("running");
            pauseResolveRef.current?.(); pauseResolveRef.current = null;
            stepResolveRef.current?.(); stepResolveRef.current = null;
        }
    }, []);

    const handleStep = useCallback(() => {
        if (["paused", "stepping"].includes(animationStateRef.current)) {
            setAnimationState("stepping");
            pauseResolveRef.current?.(); pauseResolveRef.current = null;
            stepResolveRef.current?.(); stepResolveRef.current = null;
        }
    }, []);

    const handleStop = useCallback(() => {
        setAnimationState("idle");
        generatorRef.current = null;
        pauseResolveRef.current?.(); pauseResolveRef.current = null;
        stepResolveRef.current?.(); stepResolveRef.current = null;
        setResult("");
    }, []);

    const handleReset = useCallback(() => {
        grid?.clearGrid(true);
        setResult("");
    }, [grid]);

    const isAnimating = animationState !== "idle";

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Pathfinding Visualizer</h1>

            <div className="flex gap-4 mb-4">
                <button onClick={runVisualization} disabled={isAnimating} className="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50">Start</button>
                <button onClick={handlePause} disabled={animationState !== "running"} className="px-6 py-3 bg-yellow-600 text-white rounded disabled:opacity-50">Pause</button>
                <button onClick={handleResume} disabled={!["paused", "stepping"].includes(animationState)} className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50">Resume</button>
                <button onClick={handleStep} disabled={!["paused", "stepping"].includes(animationState)} className="px-6 py-3 bg-cyan-600 text-white rounded disabled:opacity-50">Step</button>
                <button onClick={handleStop} disabled={animationState === "idle"} className="px-6 py-3 bg-red-600 text-white rounded disabled:opacity-50">Stop</button>
            </div>

            <div className="flex gap-10 mb-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Algorithm</label>
                    <select
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value as Algorithm)}
                        disabled={isAnimating}
                        className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700"
                    >
                        <option value="bfs">Breadth-First Search</option>
                        <option value="dfs">Depth-First Search</option>
                        <option value="astar">A*</option>
                        <option value="gbfs">Greedy Best-First Search</option>
                        <option value="dijkstra">Dijkstra's</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Speed</label>
                    <div className="flex gap-2 bg-gray-800 rounded p-1">
                        {(["slow", "medium", "fast"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSpeed(s)}
                                className={`px-4 py-2 rounded font-semibold ${
                                    speed === s ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleReset} disabled={isAnimating} className="px-6 py-3 bg-gray-700 text-white rounded disabled:opacity-50">
                    Reset
                </button>
            </div>

            <GridView
                rows={GRID_ROWS}
                cols={GRID_COLS}
                cellSize={CELL_SIZE}
                onGridReady={setGrid}
            />

            <div className="text-white">
                Status: <span className="font-semibold">{animationState}</span>
            </div>

            {result && <div className="mt-4 text-white bg-gray-800 px-6 py-3 rounded">{result}</div>}
        </div>
    );
}
