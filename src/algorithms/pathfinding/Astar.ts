import { IGraph, INode, AnimationStep, PathfindingResult } from "../../types"
import MinHeap from "../../utils/MinHeap";

export default function* Astar(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) return { found: false, pathLength: 0, nodesVisited: 0, path: [] };
    
    start.gCost = 0;
    start.hCost = graph.getHeuristic(start, end);

    const frontier = new MinHeap<INode>();
    frontier.insert(start, start.gCost + start.hCost, start.hCost);

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

            const tentativeG = curr.gCost + graph.getDistance(curr, neighbor);

            if (tentativeG < neighbor.gCost) {
                neighbor.parent = curr;
                neighbor.gCost = tentativeG;
                neighbor.hCost = graph.getHeuristic(neighbor, end);
                const fScore = neighbor.gCost + neighbor.hCost;
                if (frontier.has(neighbor)) {
                    frontier.decreaseKey(neighbor, fScore, neighbor.hCost);
                } else {
                    frontier.insert(neighbor, fScore, neighbor.hCost);
                }
            }
        }
        
    }

    return { found: false, pathLength: 0, nodesVisited, path: [] };
}
