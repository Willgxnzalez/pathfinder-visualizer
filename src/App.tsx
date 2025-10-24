// src/App.tsx
import React, { useRef, useState, useCallback, useEffect} from 'react';
import { GridGraph } from './components/Grid/GridGraph';
import { GridManager } from './components/Grid/GridManager';
import GridView from './components/Grid/GridView';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, START_NODE_POS, END_NODE_POS } from './utils/constants';
import bfs from './algorithms/pathfinding/bfs'
import dfs from './algorithms/pathfinding/dfs';

export default function App() {
	const graphRef = useRef<GridGraph>(new GridGraph(GRID_ROWS, GRID_COLS));
	const [manager, setManager] = useState<GridManager | null>(null);
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bfs' | 'dfs' | 'dijkstra' | 'astar'>('bfs');
	const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
	const [isRunning, setIsRunning] = useState(false);
	const [result, setResult] = useState<string>('');

	useEffect(() => {
		const graph = graphRef.current;
		graph.setStart(START_NODE_POS.row, START_NODE_POS.col);
		graph.setEnd(END_NODE_POS.row, END_NODE_POS.col);
	}, []);

	const handleManagerReady = useCallback((mgr: GridManager) => {
		setManager(mgr);
	}, []);

	const runVisualization = async () => {
		if (!manager) return;
		
		setIsRunning(true);
		setResult('');
	
		const algorithms = {
			bfs,
			dfs,
			//dijkstra,
			//astar: aStar
		};
		
		const algo = algorithms[selectedAlgorithm];
		const finalResult = await manager.runAlgorithm(algo, speed);
		
		if (finalResult.found) {
		  	setResult(`Path found! Length: ${finalResult.pathLength}, Nodes visited: ${finalResult.nodesVisited}`);
		} else {
		  	setResult(`No path found. Nodes visited: ${finalResult.nodesVisited}`);
		}
		
		setIsRunning(false);
	};

	const resetGrid = useCallback(() => {
		if (!manager) return;
		manager.resetGrid();
	}, [manager]);

  	return (
		<div className="min-h-screen bg-white–">
			{/* Algorithm selector */}
			<select 
				value={selectedAlgorithm} 
				onChange={(e) => setSelectedAlgorithm(e.target.value as any)}
				disabled={isRunning}
			>
				<option value="bfs">Breadth-First Search</option>
				<option value="dfs">Depth-First Search</option>
				<option value="dijkstra">Dijkstra's Algorithm</option>
				<option value="astar">A* Search</option>
				
			</select>

			{/* Speed selector */}
			<select 
				value={speed} 
				onChange={(e) => setSpeed(e.target.value as any)}
				disabled={isRunning}
			>
				<option value="slow">Slow</option>
				<option value="medium">Medium</option>
				<option value="fast">Fast</option>
			</select>

			<button onClick={runVisualization} disabled={isRunning}>
				{isRunning ? 'Running...' : 'Visualize'}
			</button>
			<button onClick={resetGrid} >
				Reset Grid
			</button>

			{result && <div>{result}</div>}
		
			<div className="max-w-7xl mx-auto p-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white">
						Pathfinding Visualizer
					</h1>
					<p className="text-gray-400">
						Optimized architecture - Grid uses native cells, Map uses nodes
					</p>
				</div>
				<div className="flex justify-center">
					<GridView
						graph={graphRef.current}
						manager={manager}
						cellSize={CELL_SIZE}
						onManagerReady={handleManagerReady}
					/>
				</div>
			</div>
		</div>
    );
}