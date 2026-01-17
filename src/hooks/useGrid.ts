import {
    useState,
    useLayoutEffect,
    RefObject,
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import Grid from '../models/Grid';
import GridRenderer from '../models/GridRenderer';
import { computeNodeSizeBounds, NODE_SIZE_STEP } from '../utils/gridHelpers';
import { AnimationState, AnimationStep, isGridNode } from '../types';
import { GridNode } from '../models/Node';

export default function useGrid(
    gridContainerRef: RefObject<HTMLElement | null>,
    gridViewRef: RefObject<HTMLDivElement | null>,
    animationState: AnimationState,
    setAnimationState: Dispatch<SetStateAction<AnimationState>>,
    setResult: Dispatch<SetStateAction<string>>
) {
    const [nodeSize, setNodeSize] = useState(25);
    const [nodeMin, setNodeMin] = useState(20);
    const [nodeMax, setNodeMax] = useState(120);
    const [nodeStep, setNodeStep] = useState(NODE_SIZE_STEP);
    const [grid, setGrid] = useState<Grid | null>(null);

    const rendererRef = useRef<GridRenderer | null>(null);

    // Compute node size bounds using outer container 
    useLayoutEffect(() => {
        if (!gridContainerRef.current) return;

        const { min, max, step, initial } = computeNodeSizeBounds(gridContainerRef.current);
        setNodeMin(min);
        setNodeMax(max);
        setNodeStep(step);
        setNodeSize(initial);

        console.log("compute node size bounds");
    }, []);

    // Mount renderer to GridView div
    useLayoutEffect(() => {
        if (!gridViewRef.current) return;

        const renderer = new GridRenderer();
        console.log(gridViewRef.current)
        renderer.mount(gridViewRef.current);
        rendererRef.current = renderer;

        console.log("mount renderer")

        return () => {
            renderer.destroy();
            rendererRef.current = null;
        };
    }, []);

    // Attach grid & size to renderer
    useEffect(() => {
        if (!grid || !rendererRef.current) return;

        rendererRef.current.setGrid(grid, nodeSize);
    }, [grid, nodeSize]);

    // Create grid when nodeSize changes 
    useLayoutEffect(() => {
        if (!gridContainerRef.current) return;
        console.log("run")

        const rect = gridContainerRef.current.getBoundingClientRect();
        if (rect.width < 5 || rect.height < 5) return;

        const cols = Math.max(5, Math.floor(rect.width / nodeSize));
        const rows = Math.max(5, Math.floor(rect.height / nodeSize));

        setGrid(new Grid(rows, cols));

    }, [nodeSize]);


    useLayoutEffect(() => {
        if (!gridContainerRef.current || animationState !== 'idle') return;

        let resizeTimeout: number;

        const ro = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                if (!gridContainerRef.current) return;

                const rect = gridContainerRef.current.getBoundingClientRect();
                if (rect.width < 5 || rect.height < 5) return;

                const newCols = Math.max(5, Math.floor(rect.width / nodeSize));
                const newRows = Math.max(5, Math.floor(rect.height / nodeSize));

                setGrid(prev => {
                    if (!prev) return new Grid(newRows, newCols);
                    const { rows, cols } = prev.getDimensions();
                    if (rows === newRows && cols === newCols) return prev;
                    return new Grid(newRows, newCols);
                });
            }, 50);
        });

        ro.observe(gridContainerRef.current);

        return () => {
            ro.disconnect();
            clearTimeout(resizeTimeout);
        };
    }, [animationState, nodeSize]);

    const handleNodeSizeChange = useCallback(
        (newSize: number) => {
            const snapped = Math.max(nodeMin, Math.min(nodeMax, newSize - (newSize % NODE_SIZE_STEP)));
            setNodeSize(snapped);
        }, [nodeMin, nodeMax]
    );

    const handleResetAll = useCallback(() => {
        if (!grid || !rendererRef.current) return;

        grid.resetGrid(true);
        rendererRef.current.updateAllNodes();
        setResult('');
    }, [grid, setResult]);

    const handleResetAlgorithmState = useCallback(() => {
        if (!grid || !rendererRef.current) return;

        grid.resetAlgorithmState();
        rendererRef.current.updateAllNodes();
        setResult('');
    }, [grid, setResult]);

    const handleClearWalls = useCallback(() => {
        if (!grid || !rendererRef.current) return;

        grid.clearWalls();
        rendererRef.current.updateAllNodes();
    }, [grid]);

    const handleAnimationStep = useCallback(
        async (step: AnimationStep): Promise<void> => {
            if (!rendererRef.current || !grid || !isGridNode(step.node)) return;
            if (step.type === 'visit') {
                grid.setNodeVisited(step.node as GridNode, true);
            } else if (step.type === 'path') {
                grid.setNodeInPath(step.node as GridNode, true);
            }
            rendererRef.current.updateNode(step.node as GridNode);
        }, [grid]
    );

    return {
        grid,
        gridRenderer: rendererRef.current,
        nodeSize,
        nodeMin,
        nodeMax,
        nodeStep,
        handleNodeSizeChange,
        handleResetAll,
        handleResetAlgorithmState,
        handleClearWalls,
        handleAnimationStep,
    };
}
