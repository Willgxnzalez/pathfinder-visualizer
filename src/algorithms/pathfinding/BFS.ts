import { IGraph } from "../../models/IGraph";
import { INode, AnimationStep, PathfindingResult } from "../../types";

export default function* BFS(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (start === undefined || end === undefined) 
        return { found: false, pathLength: 0, nodesVisited: 0, path: [] }
    
    const queue: INode[] = [start];
    let nodesVisited = 0;

    while (queue.length !== 0) {
        const curr = queue.shift()!;

        if (curr.isVisited) continue;

        curr.isVisited = true;

        ++nodesVisited;

        yield { type: 'visit', nodes: [curr] };

        if (curr.id === end.id ) {
            const path: INode[] = [];
            let node: INode | null = end;

            while (node != null) {
                node.isPath = true;
                path.unshift(node);
                node = node.parent; 
            }

            yield { type: 'path', nodes: path };
            return { found: true, pathLength: path.length, nodesVisited, path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (!neighbor.isVisited) {
                queue.push(neighbor)
                neighbor.parent = curr;
            }
        }
    }
    return { found: false, pathLength: 0, nodesVisited, path: [] }
}