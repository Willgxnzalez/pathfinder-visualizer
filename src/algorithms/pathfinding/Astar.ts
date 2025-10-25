import { buildErrorMessage } from "vite";
import { IGraph } from "../../models/IGraph";
import { INode, AnimationStep, PathfindingResult } from "../../types"
import MinHeap from "../../utils/MinHeap";

export default function* Astar(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (start === undefined || end === undefined) 
        return { found: false, pathLength: 0, nodesVisited: 0, path: [] }
    
    const frontier = new MinHeap<INode>();
    const visited = new Set<INode>();
    const parent = new Map<INode, INode>();

    start.gCost = 0;
    start.hCost = graph.getHeuristic(start, end);
    frontier.insert(start, start.gCost + start.hCost);
    
    let nodesVisited = 0;

    while (!frontier.isEmpty()) {
        const curr = frontier.extractMin();
        if (!curr) continue;
        
        ++nodesVisited;

        yield { type: 'visit', nodes: [curr]}

        if (curr.id === end.id) {
            const path: INode[] = [];
            let current: INode | null = end;

            while (current != null) {
                path.unshift(current);
                current = current.parent;
            }
            yield { type: 'path', nodes: path };
            return { found: true, pathLength: path.length, nodesVisited, path: path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (visited.has(neighbor)) continue;

            const newG = curr.gCost + graph.getDistance(curr, neighbor);
            if (newG < neighbor.gCost) {
                neighbor.parent = curr;
                neighbor.gCost = newG;
                neighbor.hCost = graph.getHeuristic(neighbor, end);
                const fCost = neighbor.gCost + neighbor.hCost
                if (frontier.has(neighbor)) {
                    frontier.decreaseKey(neighbor, fCost);
                } else {
                    frontier.insert(neighbor, fCost);
                }
            }
        }

    }
    return { found: false, pathLength: 0, nodesVisited, path: [] }
}