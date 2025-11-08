import { useRef, useCallback, useEffect, RefObject } from "react";
import { AnimationState, AnimationStep, IGraph, PathfindingResult, Speed } from "../types";


export interface AnimationControllerProps {
    speedRef: RefObject<Speed>;
    animationState: AnimationState;
    graph: IGraph;
    onAnimateStep: (step: AnimationStep) => Promise<void>;
    onStateChange: (state: AnimationState) => void;
    onResult: (result: string) => void;
}

export default function useAnimationController({
    speedRef,
    animationState,
    onAnimateStep,
    onStateChange,
    onResult,
}: AnimationControllerProps) {
    const generatorRef = useRef<Generator<AnimationStep, PathfindingResult, unknown> | null>(null);
    const pauseResolveRef = useRef<(() => void) | null>(null);
    const stepResolveRef = useRef<(() => void) | null>(null);
    const isRunningRef = useRef(false);
    const currentStateRef = useRef(animationState);

    useEffect(() => {
        currentStateRef.current = animationState;
    }, [animationState]);

    const getDelay = useCallback((s: Speed): number => {
        return { slow: 75, medium: 40, fast: 0 }[s];
    }, []);

    const waitForNextStep = async (delay: number): Promise<boolean> => {
        const state = currentStateRef.current;

        if (state === "stepping") {
            await new Promise<void>((resolve) => stepResolveRef.current = resolve);
            return currentStateRef.current !== "idle";
        }
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        if (currentStateRef.current === "paused") {
            await new Promise<void>((resolve) => pauseResolveRef.current = resolve);
        }
        
        return currentStateRef.current !== "idle";
    };

    const run = useCallback(
        async (algorithmGenerator: () => Generator<AnimationStep, PathfindingResult, unknown>) => {
            onResult("");
            onStateChange('running');
            isRunningRef.current = true;

            try {
                generatorRef.current = algorithmGenerator();
                let result = generatorRef.current.next();

                while (!result.done && isRunningRef.current) {
                    await onAnimateStep(result.value);
                    const shouldContinue = await waitForNextStep(getDelay(speedRef.current));
                    
                    if (!shouldContinue) {
                        isRunningRef.current = false;
                        onStateChange('idle');
                        onResult('Stopped');
                        return;
                    }

                    result = generatorRef.current.next();
                }

                if (isRunningRef.current) {
                    const final = result.value as PathfindingResult;
                    if (final.found && final.path) {
                        await onAnimateStep({ type: "path", nodes: final.path });
                    }
                    isRunningRef.current = false;
                    onStateChange('idle');
                    onResult(final.found ? "Path found!" : "No path found.");
                }
            } catch (err) {
                console.error("Visualization error:", err);
                isRunningRef.current = false;
                onStateChange('idle');
                onResult('Error');
            }
        },
        [getDelay, onAnimateStep, waitForNextStep, onStateChange, onResult]
    );

    const stop = useCallback(() => {
        isRunningRef.current = false;
        onStateChange('idle');
    }, [onStateChange]);

    const pause = useCallback(() => {
        onStateChange('paused');
    }, [onStateChange]);

    const resume = useCallback(() => {
        onStateChange('running');
        pauseResolveRef.current?.();
        pauseResolveRef.current = null;
        stepResolveRef.current?.();
        stepResolveRef.current = null;
    }, [onStateChange]);

    const step = useCallback(() => {
        if (['paused', 'stepping'].includes(currentStateRef.current)) {
            onStateChange('stepping');
            pauseResolveRef.current?.();
            pauseResolveRef.current = null;
            stepResolveRef.current?.();
            stepResolveRef.current = null;
        }
    }, [onStateChange]);

    return { run, stop, pause, resume, step };
}