import BFS from '../src/algorithms/pathfinding/BFS';
import DFS from '../src/algorithms/pathfinding/DFS';
import Dijkstra from '../src/algorithms/pathfinding/Dijkstra';
import Astar from '../src/algorithms/pathfinding/Astar';
import GBFS from '../src/algorithms/pathfinding/GBFS';
import Grid from '../src/models/Grid';
import { describe, expect, it } from 'vitest';


// Returns a grid like this by default (S = start, E = end, . = walkable, # = wall):
// S . . . .
// . . . . .
// . . . . .
// . . . . .
// . . . . E
function makeSimpleGrid(opts?: Partial<{rows: number, cols: number, start: [number,number], end: [number,number], walls: [number, number][]}>) {
    const {rows = 5, cols = 5, start = [0, 0], end = [4, 4], walls = []} = opts || {};
    const grid = new Grid(rows, cols);
    grid.setStartNode(...start);
    grid.setEndNode(...end);
    for (const [r, c] of walls) {
        grid.setNodeWalkable(grid.getNode(r, c)!, false);
    }
    return grid;
}

function resultFromGenerator<T>(gen: Generator<any, T, unknown>): T {
    let last: IteratorResult<any, T>;
    do {
        last = gen.next();
    } while (!last.done);
    return last.value;
}

describe('Pathfinding Algorithms', () => {
    const algos: {[k: string]: (g: Grid) => Generator<any, any, unknown>} = {
        BFS,
        DFS,
        Dijkstra,
        Astar,
        GBFS
    };

    for (const [name, algo] of Object.entries(algos)) {
        describe(name, () => {
            it('finds a path on an open grid', () => {
                const grid = makeSimpleGrid();;
                const result = resultFromGenerator(algo(grid));
                expect(result.found).toBe(true);
                expect(result.pathLength).toBeGreaterThan(0);
                expect(result.path.at(0)?.id).toBe(grid.getNode(0, 0)!.id);
                expect(result.path.at(-1)?.id).toBe(grid.getNode(4, 4)!.id);
            });

            it('returns found: false if no path exists', () => {
                // S . . . .
                // . . . . .
                // # # # # #
                // . . . . .
                // . . . . E
                const walls: [number, number][] = [];
                for (let c = 0; c < 5; ++c) {
                    walls.push([2, c]);
                }
                const grid = makeSimpleGrid({walls});
                const result = resultFromGenerator(algo(grid));
                expect(result.found).toBe(false);
                expect(result.pathLength).toBe(0);
                expect(result.path.length).toBe(0);
            });

            it('finds minimal or reasonable length path avoiding walls', () => {
                // Grid:
                // S . . . .
                // # # # # .
                // . . . . .
                // . . . . .
                // . . . . E
                const walls: [number, number][] = [[1,0], [1,1], [1,2], [1,3]];
                const grid = makeSimpleGrid({walls});
                const result = resultFromGenerator(algo(grid));
                expect(result.found).toBe(true);
                // It must go down, then right, then down again, length should be at least 9 (with detour).
                expect(result.pathLength).toBeGreaterThan(6);
                expect(result.path[0].id).toBe(grid.getNode(0, 0)!.id);
                expect(result.path.at(-1)?.id).toBe(grid.getNode(4, 4)!.id);
            });

            it('returns found: false if either start or end is blocked', () => {
                // Block start node:
                // S # . . .
                // # . . . .
                // . . . . .
                // . . . . .
                // . . . . E
                let grid = makeSimpleGrid();
                grid.setNodeWalkable(grid.getNode(1, 0)!, false);
                grid.setNodeWalkable(grid.getNode(0, 1)!, false);
                let result = resultFromGenerator(algo(grid));
                expect(result.found).toBe(false);

                // Block end node:
                // S . . . .
                // . . . . .
                // . . . . .
                // . . . . .
                // . . . . E
                grid = makeSimpleGrid();
                grid.setNodeWalkable(grid.getNode(4, 3)!, false);
                grid.setNodeWalkable(grid.getNode(3, 4)!, false);
                result = resultFromGenerator(algo(grid));
                expect(result.found).toBe(false);
            });
        });
    }
});

