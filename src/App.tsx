// src/App.tsx
import React, { useRef, useState, useCallback, useEffect} from 'react';
import { GridGraph } from './components/Grid/GridGraph';
import { GridManager } from './components/Grid/GridManager';
import GridView from './components/Grid/GridView';
import { GRID_ROWS, GRID_COLS, CELL_SIZE } from './utils/constants';

export default function App() {
	const graphRef = useRef<GridGraph>(new GridGraph(GRID_ROWS, GRID_COLS));
	const [manager, setManager] = useState<GridManager | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		const graph = graphRef.current;
	}, []);

	const handleManagerReady = useCallback((mgr: GridManager) => {
		setManager(mgr);
	}, []);

  	return (
		<div className="min-h-screen bg-midnight">
			<div className="max-w-7xl mx-auto p-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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