import { buildErrorMessage } from "vite";
import { IGraph } from "../../models/IGraph";
import { INode, AnimationStep, PathfindingResult } from "../../types"
import MinHeap from "../../utils/MinHeap";

export default function* Astar(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) 
        return { found: false, pathLength: 0, nodesVisited: 0, path: [] };

    const frontier = new MinHeap<INode>();

    start.gCost = 0;
    start.hCost = graph.getHeuristic(start, end);

    frontier.insert(start, start.gCost + start.hCost);

    let nodesVisited = 0;

    while (!frontier.isEmpty()) {
        const curr = frontier.extractMin();
        if (!curr || curr.isVisited) continue;

        curr.isVisited = true;
        nodesVisited++;

        yield { type: 'visit', nodes: [curr] };

        if (curr.id === end.id) {
            const path: INode[] = [];
            let node: INode | null = end;
            while (node) {
                node.isPath = true;
                path.unshift(node);
                node = node.parent;
            }
            yield { type: 'path', nodes: path };
            return { found: true, pathLength: path.length, nodesVisited, path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (neighbor.isVisited) continue;
        
            const newG = curr.gCost + graph.getDistance(curr, neighbor);
        
            if (newG < neighbor.gCost) {
                neighbor.parent = curr;
                neighbor.gCost = newG;
                neighbor.hCost = graph.getHeuristic(neighbor, end);
                const fCost = neighbor.gCost + neighbor.hCost;
                frontier.insert(neighbor, fCost);
            }
        }
        
    }

    return { found: false, pathLength: 0, nodesVisited, path: [] };
}
