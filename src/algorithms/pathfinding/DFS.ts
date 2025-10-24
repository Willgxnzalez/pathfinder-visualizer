import { IGraph } from "../../models/IGraph";
import { INode, AnimationStep, PathfindingResult } from "../../types";

export default function* DFS(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (start === undefined || end === undefined) 
        return { found: false, pathLength: 0, nodesVisited: 0, path: [] }
    
    const stack: INode[] = [start];
    const visited = new Set<INode>();
    const parent = new Map<INode, INode>();
    let nodesVisited = 0;

    while (stack.length !== 0) {
        const curr = stack.pop()!;

        if (visited.has(curr)) continue;

        visited.add(curr);

        ++nodesVisited;

        yield { type: 'visit', nodes: [curr] };

        if (curr.id === end.id ) {
            const path: INode[] = [];
            let current: INode | undefined = end;

            while (current) {
                path.unshift(current);
                current = parent.get(current);
            }
            yield { type: 'path', nodes: path };
            return { found: true, pathLength: path.length, nodesVisited, path: path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (!visited.has(neighbor)) {
                stack.push(neighbor);
                parent.set(neighbor, curr);
            }
        }
    }
    return { found: false, pathLength: 0, nodesVisited, path: [] }
}