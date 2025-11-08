import { useCallback } from 'react';
import { Algorithm, AnimationState, AnimationStep, IGraph, PathfindingResult, Speed } from '../types';
import useAnimationController from './useAnimationController';
import BFS from '../algorithms/pathfinding/BFS';
import Astar from '../algorithms/pathfinding/Astar';
import DFS from '../algorithms/pathfinding/DFS';
import Dijkstra from '../algorithms/pathfinding/Dijkstra';
import GBFS from '../algorithms/pathfinding/GBFS';

const algorithms: Record<string, (graph: IGraph) => Generator<AnimationStep, PathfindingResult, unknown>> = {
    BFS,
    Astar,
    DFS,
    Dijkstra,
    GBFS,
};

export default function usePathfinding(
    speedRef: React.RefObject<Speed>,
    animationState: AnimationState,
    selectedAlgorithm: Algorithm,
    graph: IGraph | null,
    onAnimateStep: (step: AnimationStep) => Promise<void>,
    onStateChange: (state: AnimationState) => void,
    onResult: (result: string) => void,
) {
    const animation = useAnimationController({
        speedRef,
        animationState,
        graph: graph!,
        onAnimateStep: onAnimateStep,
        onStateChange,
        onResult,
    });

    const animate = useCallback(() => {
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
        animate,
        handlePlayPause: () => {
            if (["paused", "stepping"].includes(animationState)) {
                animation.resume();
            } else if (animationState === "running") {
                animation.pause();
            }
        },
        handleStep: animation.step,
        handleStop: animation.stop,
    };
}