import { IGraph, INode, AnimationStep, PathfindingResult } from '../../types';

export default function* BFS(graph: IGraph): Generator<AnimationStep, PathfindingResult, unknown> {
    const start = graph.getStartNode();
    const end = graph.getEndNode();

    if (!start || !end) return { found: false, nodesVisited: 0, path: [] }
    
    const queue: INode[] = [start];
    let head = 0;
    let nodesVisited = 0;

    while (head < queue.length) {
        const curr = queue[head++];
        if (!curr || curr.isVisited) continue;

        curr.isVisited = true;
        nodesVisited++;

        yield { type: 'visit', node: curr};

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
                queue.push(neighbor);
                neighbor.parent = curr;
            }
        }
    }
    return { found: false, nodesVisited, path: [] }
}