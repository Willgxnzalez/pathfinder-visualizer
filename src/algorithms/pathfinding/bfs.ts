import { esbuildVersion } from "vite";
import { IGraph } from "../../geometry/IGraph";
import { AnimationStep, PathfindingResult } from "../../types";

export default function* bfs(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const startId = graph.getStartNodeId();
    const endId = graph.getEndNodeId();

    if (startId === undefined || endId === undefined) 
        return { found: false, pathLength: 0, nodesVisited: 0, path: [] }
    
    const queue: number[] = [startId];
    const visited = new Set<number>();
    const parent = new Map<number, number>();
    let nodesVisited = 0;

    while (queue.length !== 0) {
        const currId = queue.shift()!;
        
        if (visited.has(currId)) {
            ("visited before")
            continue;
        }
        visited.add(currId);
        ++nodesVisited;
        yield { type: 'visit', nodeIds: [currId] };

        if (currId === endId ) {
            const path: number[] = [];
            let current: number | undefined = endId;

            while (current) {
                path.unshift(current);
                current = parent.get(current);
            }
            yield { type: 'path', nodeIds: path };
            return { found: true, pathLength: path.length, nodesVisited, path };
        }

        for (const neighbor of graph.getNeighbors(currId)) {
            if (!visited.has(neighbor.id)) {
                queue.push(neighbor.id);
                parent.set(neighbor.id, currId);
            }
        }
    }
    return { found: false, pathLength: 0, nodesVisited, path: [] }
}