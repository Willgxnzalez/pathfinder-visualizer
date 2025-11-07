// hooks/usePathfindingVisualization.ts
import { useCallback } from 'react';
import { Algorithm, AnimationStep, PathfindingResult } from '../types';
import { useVisualization } from './useVisualization';
import BFS from '../algorithms/pathfinding/BFS';
import Astar from '../algorithms/pathfinding/Astar';
import DFS from '../algorithms/pathfinding/DFS';
import Dijkstra from '../algorithms/pathfinding/Dijkstra';
import GBFS from '../algorithms/pathfinding/GBFS';

const algorithms: Record<string, (graph: any) => Generator<AnimationStep, PathfindingResult, unknown>> = {
    BFS,
    Astar,
    DFS,
    Dijkstra,
    GBFS,
};

export function usePathfindingVisualization({
    speed,
    uiState,
    selectedAlgorithm,
    graph,
    onVisualizationStep,
    onStateChange,
    onResult,
}: any) {
    // useVisualization takes a single object argument according to fixed API
    const animation = useVisualization({
        speed,
        uiState,
        graph,
        onVisualizationStep,
        onStateChange,
        onResult,
    });

    const runVisualization = useCallback(() => {
        if (!graph) {
            onResult("Grid not initialized!");
            return;
        }
        if (!graph.getStartNode() || !graph.getEndNode()) {
            onResult("Set start and end nodes!");
            return;
        }
        const Algo = algorithms[selectedAlgorithm] || Astar;
        animation.run(() => Algo(graph));
    }, [animation, graph, selectedAlgorithm, onResult]);

    return {
        runVisualization,
        handlePlayPause: () => {
            if (
                uiState.animationState === "paused" ||
                uiState.animationState === "stepping"
            ) {
                animation.resume();
            } else if (uiState.animationState === "running") {
                animation.pause();
            }
        },
        handleStep: animation.step,
        handleStop: animation.stop,
    };
}