import { IGraph, INode, AnimationStep, PathfindingResult } from "../../types"
import MinHeap from "../../utils/MinHeap";

export default function* GBFS(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) return { found: false, pathLength: 0, nodesVisited: 0, path: [] };

    start.hCost = graph.getHeuristic(start, end);

    const frontier = new MinHeap<INode>();
    frontier.insert(start, start.hCost);

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
                path.push(node);
                node = node.parent;
            }
            
            path.reverse();

            yield { type: 'path', nodes: path };
            return { found: true, pathLength: path.length, nodesVisited, path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (neighbor.isVisited) continue;
            neighbor.hCost = graph.getHeuristic(neighbor, end);
            if (!frontier.has(neighbor)) {
                neighbor.parent = curr;
                frontier.insert(neighbor, neighbor.hCost);
            } else {
                frontier.decreaseKey(neighbor, neighbor.hCost);
            }
        }
        
    }

    return { found: false, pathLength: 0, nodesVisited, path: [] };
}
