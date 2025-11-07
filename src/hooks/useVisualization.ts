import { useRef, useCallback, useEffect } from "react";
import { VisualizationHookProps, AnimationStep, PathfindingResult } from "../types";

export function useVisualization({
    speed,
    uiState,
    graph,
    onVisualizationStep,
    onStateChange,
    onResult,
}: VisualizationHookProps) {
    const generatorRef = useRef<Generator<AnimationStep, PathfindingResult, unknown> | null>(null);
    const pauseResolveRef = useRef<(() => void) | null>(null);
    const stepResolveRef = useRef<(() => void) | null>(null);
    const isRunningRef = useRef(false);
    const currentStateRef = useRef(uiState.animationState);

    useEffect(() => {
        currentStateRef.current = uiState.animationState;
    }, [uiState.animationState]);

    const getDelay = useCallback((s: "slow" | "medium" | "fast"): number => {
        return { slow: 75, medium: 40, fast: 0 }[s];
    }, []);

    const waitForNextStep = useCallback(async (delay: number): Promise<boolean> => {
        return new Promise((resolve) => {
            const checkState = () => {
                const currentState = currentStateRef.current;
                
                if (currentState === "idle" || !isRunningRef.current) {
                    resolve(false);
                    return;
                }

                if (currentState === "paused") {
                    pauseResolveRef.current = () => {
                        pauseResolveRef.current = null;
                        resolve(true);
                    };
                } 
                else if (currentState === "stepping") {
                    stepResolveRef.current = () => {
                        stepResolveRef.current = null;
                        // ✅ revert back to paused after one step
                        onStateChange("paused");
                        resolve(true);
                    };
                } 
                else {
                    resolve(true);
                }
            };

            setTimeout(checkState, delay);
        });
    }, [onStateChange]);

    const run = useCallback(
        async (algorithmGenerator: () => Generator<AnimationStep, PathfindingResult, unknown>) => {
            onResult("");
            onStateChange("running");
            isRunningRef.current = true;

            try {
                generatorRef.current = algorithmGenerator();
                const delay = getDelay(speed);

                let result = generatorRef.current.next();

                while (!result.done && isRunningRef.current) {
                    await onVisualizationStep(result.value);
                    const shouldContinue = await waitForNextStep(delay);
                    
                    if (!shouldContinue) {
                        isRunningRef.current = false;
                        onStateChange("idle");
                        onResult("Stopped");
                        return;
                    }

                    result = generatorRef.current.next();
                }

                if (isRunningRef.current) {
                    const final = result.value as PathfindingResult;
                    if (final.found && final.path) {
                        await onVisualizationStep({ type: "path", nodes: final.path });
                    }
                    isRunningRef.current = false;
                    onStateChange("idle");
                    onResult(final.found ? "Path found!" : "No path found.");
                }
            } catch (err) {
                console.error("Visualization error:", err);
                isRunningRef.current = false;
                onStateChange("idle");
                onResult("Error");
            }
        },
        [speed, getDelay, onVisualizationStep, waitForNextStep, onStateChange, onResult]
    );

    const stop = useCallback(() => {
        isRunningRef.current = false;
        onStateChange("idle");
    }, [onStateChange]);

    const pause = useCallback(() => {
        onStateChange("paused");
    }, [onStateChange]);

    const resume = useCallback(() => {
        onStateChange("running");
        pauseResolveRef.current?.();
        pauseResolveRef.current = null;
    }, [onStateChange]);

    const step = useCallback(() => {
        // ✅ behaves like old version
        if (["paused", "stepping"].includes(currentStateRef.current)) {
            onStateChange("stepping");
            pauseResolveRef.current?.();
            pauseResolveRef.current = null;
            stepResolveRef.current?.();
            stepResolveRef.current = null;
        }
    }, [onStateChange]);

    return { run, stop, pause, resume, step };
}
