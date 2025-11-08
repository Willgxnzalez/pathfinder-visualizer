import { IGraph, INode, AnimationStep, PathfindingResult } from "../../types"
import MinHeap from "../../utils/MinHeap";

export default function* Astar(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) return { found: false, nodesVisited: 0, path: [] };
    
    start.gCost = 0;
    start.hCost = graph.getHeuristic(start, end);

    const frontier = new MinHeap<INode>();
    frontier.insert(start, start.fCost());

    let nodesVisited = 0;

    while (!frontier.isEmpty()) {
        const curr = frontier.extractMin();
        if (!curr || curr.isVisited) continue;

        curr.isVisited = true;
        nodesVisited++;

        yield { type: 'visit', node: curr};

        if (curr.id === end.id) {
            const path: INode[] = [];
            let node: INode | null = end;
            while (node) {
                node.isPath = true;
                path.push(node);
                node = node.parent;
            }

            path.reverse();

            return { found: true, nodesVisited, path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (neighbor.isVisited) continue;

            const tentativeG = curr.gCost + graph.getDistance(curr, neighbor);
            if (tentativeG < neighbor.gCost) {
                neighbor.parent = curr;
                neighbor.gCost = tentativeG;
                neighbor.hCost = graph.getHeuristic(neighbor, end);
                if (frontier.has(neighbor)) {
                    frontier.decreaseKey(neighbor, neighbor.fCost());
                } else {
                    frontier.insert(neighbor, neighbor.fCost());
                }
            }
        }
        
    }

    return { found: false, nodesVisited, path: [] };
}