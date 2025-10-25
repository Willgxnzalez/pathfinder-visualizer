import { IGraph } from "../../models/IGraph";
import { INode, AnimationStep, PathfindingResult } from "../../types"
import MinHeap from "../../utils/MinHeap";

export default function* Dijkstra(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) return { found: false, pathLength: 0, nodesVisited: 0, path: [] };

    start.gCost = 0;

    const frontier = new MinHeap<INode>();
    frontier.insert(start, 0);

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
            const newDist = curr.gCost + graph.getDistance(curr, neighbor);
            if (newDist < neighbor.gCost) {
                neighbor.gCost = newDist;
                neighbor.parent = curr;

                if (frontier.has(neighbor)) {
                    frontier.decreaseKey(neighbor, newDist);
                } else {
                    frontier.insert(neighbor, newDist);
                }
            }
        }
    }

    return { found: false, pathLength: 0, nodesVisited, path: [] };
}
