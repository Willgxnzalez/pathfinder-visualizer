import { IGraph } from "../../geometry/IGraph";
import { AnimationStep, PathfindingResult } from "../../types";

export default function* dfs(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const startId = graph.getStartNodeId();
    const endId = graph.getEndNodeId();

    if (startId === undefined || endId === undefined)
        return { found: false, pathLength: 0, nodesVisited: 0, path: [] };

    const stack: number[] = [startId];
    const visited = new Set<number>();
    const parent = new Map<number, number>();
    let nodesVisited = 0;

    while (stack.length !== 0) {
        const currId = stack.pop()!;

        if (visited.has(currId)) continue;

        visited.add(currId);
        ++nodesVisited;

        yield { type: 'visit', nodeIds: [currId] };

        if (currId === endId) {
            const path: number[] = [];
            let current: number | undefined = endId;
            while (current !== undefined) {
                path.unshift(current);
                current = parent.get(current);
            }
            yield { type: 'path', nodeIds: path };
            return { found: true, pathLength: path.length, nodesVisited, path };
        }

        // Push unvisited neighbors to the stack.
        for (const neighbor of graph.getNeighbors(currId)) {
            if (!visited.has(neighbor.id)) {
                stack.push(neighbor.id);
                parent.set(neighbor.id, currId);
            }
        }
    }
    return { found: false, pathLength: 0, nodesVisited, path: [] };
}