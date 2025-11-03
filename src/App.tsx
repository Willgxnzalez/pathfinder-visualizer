import React, { useState, useRef, useEffect, useCallback } from "react";
import BFS from "./algorithms/pathfinding/BFS";
import DFS from "./algorithms/pathfinding/DFS";
import Astar from "./algorithms/pathfinding/Astar";
import GBFS from "./algorithms/pathfinding/GBFS";
import Dijkstra from "./algorithms/pathfinding/Dijkstra";
import Grid from "./models/Grid";
import GridView from "./components/GridView";
import ToolBar from "./components/ToolBar";
import { AnimationState, AnimationStep, PathfindingResult, Algorithm } from "./types";
import { computeCellSizeBounds, computeInitialCellSize } from "./utils/gridSizing";
import clsx from "clsx";

export default function App() {
    const [grid, setGrid] = useState<Grid | null>(null);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [speed, setSpeed] = useState<"slow" | "medium" | "fast">("medium");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("bfs");
    const [result, setResult] = useState("");
    const [isDrawing, setIsDrawing] = useState(false);
    const [cellSize, setCellSize] = useState<number>(0);
    const [cellMin, setCellMin] = useState<number>(20);
    const [cellMax, setCellMax] = useState<number>(120);
    const [cellStep, setCellStep] = useState<number>(5);

    const animationStateRef = useRef(animationState);
    const speedRef = useRef(speed);
    const generatorRef = useRef<Generator<AnimationStep, PathfindingResult, unknown> | null>(null);
    const pauseResolveRef = useRef<(() => void) | null>(null);
    const stepResolveRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        animationStateRef.current = animationState;
    }, [animationState]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    useEffect(() => {
        const { min, max, step } = computeCellSizeBounds();
        setCellMin(min);
        setCellMax(max);
        setCellStep(step);
        const initial = computeInitialCellSize();
        const clamped = Math.max(min, Math.min(max, initial));
        setCellSize(clamped);
        setGrid(new Grid(clamped));
    }, []);

    const handleCellSizeChange = useCallback((size: number) => {
        setCellSize(size);
        grid?.setCellSize(size);
    }, [grid]);

    const getDelay = (s: "slow" | "medium" | "fast"): number => ({ slow: 75, medium: 40, fast: 0 }[s]);

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
            step.nodes.forEach((node) => grid.setNodeVisited(node));
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

        grid.resetGrid(false);
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

    const handlePlayPause = useCallback(() => {
        if (animationStateRef.current === "running") {
            setAnimationState("paused");
        } else if (["paused", "stepping"].includes(animationStateRef.current)) {
            setAnimationState("running");
            pauseResolveRef.current?.();
            pauseResolveRef.current = null;
            stepResolveRef.current?.();
            stepResolveRef.current = null;
        }
    }, []);

    const handleStep = useCallback(() => {
        if (["paused", "stepping"].includes(animationStateRef.current)) {
            setAnimationState("stepping");
            pauseResolveRef.current?.();
            pauseResolveRef.current = null;
            stepResolveRef.current?.();
            stepResolveRef.current = null;
        }
    }, []);

    const handleStop = useCallback(() => {
        setAnimationState("idle");
        generatorRef.current = null;
        pauseResolveRef.current = null;
        stepResolveRef.current = null;
        setResult("");
    }, []);

    const handleReset = useCallback(() => {
        grid?.resetGrid(true);
        setResult("");
    }, [grid]);

    return (
        <div className="w-screen h-screen text-text-main relative overflow-hidden bg-background-1">
            <header className="w-full absolute left-0 top-0 flex justify-between items-center px-4 py-2 z-10 pointer-events-none">
                <h1 className="text-2xl font-bold text-text-main">Pathfinding Visualizer</h1>
                <div className="pointer-events-auto">dark mode toggle | map mode toggle</div>
            </header>

            {/* Grid */}
            {grid && <GridView grid={grid} onDrawingChange={setIsDrawing} />}

            {/* Floating UI*/}
            <div className={clsx(" transition-all duration-150", isDrawing ? "pointer-events-none opacity-60" : "pointer-events-auto")}>
                <ToolBar
                    mapMode={false}
                    animationState={animationState}
                    selectedAlgorithm={selectedAlgorithm}
                    speed={speed}
                    cellSize={cellSize}
                    cellMin={cellMin}
                    cellMax={cellMax}
                    cellStep={cellStep}
                    onRun={runVisualization}
                    onReset={handleReset}
                    onAlgorithmChange={setSelectedAlgorithm}
                    onSpeedChange={setSpeed}
                    onCellSizeChange={handleCellSizeChange}
                />

                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 rounded-full glass shadow-lg">
                    <button onClick={handleStop}>STOP</button>
                    <button onClick={handlePlayPause}>⏯</button>
                    <button onClick={handleStep}>⏭</button>
                </div>
            </div>
        </div>
    );
}