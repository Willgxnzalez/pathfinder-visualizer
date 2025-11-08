import { IGraph, INode, AnimationStep, PathfindingResult } from "../../types";

export default function* DFS(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) return { found: false, nodesVisited: 0, path: [] }
    
    const stack: INode[] = [start];

    let nodesVisited = 0;

    while (stack.length !== 0) {
        const curr = stack.pop();
        if (!curr || curr.isVisited) continue;

        curr.isVisited = true;
        nodesVisited++;

        yield { type: 'visit', node: curr };

        if (curr.id === end.id ) {
            const path: INode[] = [];
            let node: INode | null = end;

            while (node != null) {
                node.isPath = true;
                path.push(node);
                node = node.parent;
            }
            
            path.reverse();

            return { found: true, nodesVisited, path };
        }

        for (const neighbor of graph.getNeighbors(curr)) {
            if (!neighbor.isVisited) {
                stack.push(neighbor);
                neighbor.parent = curr;
            }
        }
    }
    return { found: false, nodesVisited, path: [] }
}