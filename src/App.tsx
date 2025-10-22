// src/App.tsx
import './App.css';
import Grid from './components/Grid/Grid';
import { createGrid } from './utils/gridHelpers';
import { Cell } from './types';
import React, { useState, useCallback } from 'react';

function App() {
    const [grid, setGrid] = useState<Cell[][]>(createGrid());
    const [isRunning, setIsRunning] = useState(false);
    
    // Allow both direct and functional updates

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
          <h1 className="text-3xl font-bold text-cyan-500 mb-4">Pathfinding Visualizer</h1>
          <Grid 
            grid={grid} 
            onGridChange={setGrid} 
            isRunning={isRunning} 
          />
        </div>
    );
}

export default App;