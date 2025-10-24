import React, { useState, useRef, useEffect, useCallback } from 'react';
import bfs from './algorithms/pathfinding/bfs';
import { GridManager } from './components/grid/GridManager';
import { GridGraph } from './components/grid/GridGraph';
import GridView from './components/grid/GridView';
import { AnimationState, AnimationStep, PathfindingResult, Algorithm } from './types';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, START_NODE_POS, END_NODE_POS } from './utils/constants';
import { IGraph } from './geometry/IGraph';

export default function App() {
    const graphRef = useRef(new GridGraph(GRID_ROWS, GRID_COLS));
    const [manager, setManager] = useState<GridManager | null>(null);

    // Reactive + ref-synced animation state
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const animationStateRef = useRef(animationState);
    useEffect(() => { animationStateRef.current = animationState }, [animationState]);

    // Reactive + ref-synced speed
    const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
    const speedRef = useRef(speed);
    useEffect(() => { speedRef.current = speed }, [speed]);

    // Algorithm selection
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bfs');

    // Generator + control refs
    const generatorRef = useRef<Generator<AnimationStep, PathfindingResult, unknown> | null>(null);
    const pauseResolveRef = useRef<(() => void) | null>(null);
    const stepResolveRef = useRef<(() => void) | null>(null);

    const [result, setResult] = useState('');

    useEffect(() => {
        const graph = graphRef.current;
        graph.setStart(START_NODE_POS.row, START_NODE_POS.col);
        graph.setEnd(END_NODE_POS.row, END_NODE_POS.col);
    }, []);

    const handleManagerReady = useCallback((mgr: GridManager) => {
        setManager(mgr);
    }, []);

    const getDelay = (s: 'slow' | 'medium' | 'fast') => {
        const speedMap = { slow: 100, medium: 20, fast: 5 };
        return speedMap[s];
    };

    const waitForNextStep = async (delay: number): Promise<boolean> => {
        const state = animationStateRef.current;

        if (state === 'stepping') {
            await new Promise<void>(resolve => { stepResolveRef.current = resolve });
            return animationStateRef.current !== 'idle';
        }

        await new Promise(resolve => setTimeout(resolve, delay));

        if (animationStateRef.current === 'paused') {
            await new Promise<void>(resolve => { pauseResolveRef.current = resolve });
        }

        return animationStateRef.current !== 'idle';
    };

	const renderStep = async (step: AnimationStep, graph: GridGraph, manager: GridManager, delay: number): Promise<void> => {
		if (step.type === 'visit') {
			for (const nodeId of step.nodeIds) {
				graph.markVisited(nodeId);
				const node = graph.getNode(nodeId);
				if (node) manager.updateNode(node);
			}
		} else if (step.type === 'path') {
			await new Promise(r => setTimeout(r, delay * 10));
			for (const nodeId of step.nodeIds) {
				graph.markPath(nodeId);
				const node = graph.getNode(nodeId);
				if (node) manager.updateNode(node);
				await new Promise(r => setTimeout(r, delay));
			}
		}
	}

    const runVisualization = useCallback(async () => {
        if (!manager) return;

        const graph = graphRef.current;

        graph.clearGrid(true);
        manager.updateAllNodes();

        setResult('');
        setAnimationState('running');

        const algorithm = bfs; // You’ll switch this later using selectedAlgorithm
        generatorRef.current = algorithm(graph);

        let delay = getDelay(speedRef.current);
        let result = generatorRef.current.next();

        while (!result.done) {
            const step = result.value;

            renderStep(step, graph, manager, delay);

            const shouldContinue = await waitForNextStep(delay);
            if (!shouldContinue) {
                setResult('Stopped');
                setAnimationState('idle');
                generatorRef.current = null;
                return;
            }

            delay = getDelay(speedRef.current);
            result = generatorRef.current.next();
        }

        const finalResult = result.value;

        setAnimationState('idle');
        generatorRef.current = null;

        if (finalResult.found)
            setResult(`Path found! Length: ${finalResult.pathLength}, Nodes visited: ${finalResult.nodesVisited}`);
        else
            setResult(`No path found. Nodes visited: ${finalResult.nodesVisited}`);
    }, [manager]);

    const handlePause = useCallback(() => {
        if (animationStateRef.current === 'running') setAnimationState('paused');
    }, []);

    const handleResume = useCallback(() => {
        if (animationStateRef.current === 'paused' || animationStateRef.current === 'stepping') {
            setAnimationState('running');
            if (pauseResolveRef.current) { pauseResolveRef.current(); pauseResolveRef.current = null; }
            if (stepResolveRef.current) { stepResolveRef.current(); stepResolveRef.current = null; }
        }
    }, []);

    const handleStep = useCallback(() => {
        if (animationStateRef.current === 'paused' || animationStateRef.current === 'stepping') {
            setAnimationState('stepping');
            if (pauseResolveRef.current) { pauseResolveRef.current(); pauseResolveRef.current = null; }
            if (stepResolveRef.current) { stepResolveRef.current(); stepResolveRef.current = null; }
        }
    }, []);

    const handleStop = useCallback(() => {
        setAnimationState('idle');
        generatorRef.current = null;

        if (pauseResolveRef.current) { pauseResolveRef.current(); pauseResolveRef.current = null; }
        if (stepResolveRef.current) { stepResolveRef.current(); stepResolveRef.current = null; }

        setResult('');
    }, []);

    const handleReset = useCallback(() => {
        if (!manager) return;
        const graph = graphRef.current;
        graph.clearGrid(false);
        manager.updateAllNodes();
        setResult('');
    }, [manager]);

    const isAnimating = animationState !== 'idle';

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Pathfinding Visualizer</h1>

            <div className="flex gap-4 mb-4">
                <button onClick={runVisualization} disabled={isAnimating} className="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50">Start</button>
                <button onClick={handlePause} disabled={animationState !== 'running'} className="px-6 py-3 bg-yellow-600 text-white rounded disabled:opacity-50">Pause</button>
                <button onClick={handleResume} disabled={animationState !== 'paused' && animationState !== 'stepping'} className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50">Resume</button>
                <button onClick={handleStep} disabled={animationState !== 'paused' && animationState !== 'stepping'} className="px-6 py-3 bg-cyan-600 text-white rounded disabled:opacity-50">Step</button>
                <button onClick={handleStop} disabled={animationState === 'idle'} className="px-6 py-3 bg-red-600 text-white rounded disabled:opacity-50">Stop</button>
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
                        <option value="dijkstra">Dijkstra's</option>
                        <option value="astar">A*</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Speed</label>
                    <div className="flex gap-2 bg-gray-800 rounded p-1">
                        {(['slow', 'medium', 'fast'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setSpeed(s)}
                                className={`px-4 py-2 rounded font-semibold ${
                                    speed === s ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
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

            <div className="mb-8">
                <GridView
                    graph={graphRef.current}
                    manager={manager}
                    cellSize={CELL_SIZE}
                    onManagerReady={handleManagerReady}
                />
            </div>

            <div className="text-white">Status: <span className="font-semibold">{animationState}</span></div>

            {result && (
                <div className="mt-4 text-white bg-gray-800 px-6 py-3 rounded">{result}</div>
            )}
        </div>
    );
}
