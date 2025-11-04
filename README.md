# Pathfinding Visualizer

An interactive visualizer for classic pathfinding algorithms. This project allows you to explore and compare various algorithms step-by-step on a grid-based interface or on a real world map.

## Description

This application provides a hands-on tool to visualize how different pathfinding algorithms (like BFS, DFS, Dijkstra, A*, GBFS) operate. Users can set start/end nodes, draw walls, and watch the algorithm find the shortest path. The UI is designed with flexibility and customization in mind, with plans to support grid and map-based visualizations, real-time animation controls, and in-depth algorithm insights.

## Frameworks & Tools Used

- **React** (v19) – UI component library
- **TypeScript** – Type safety and enhanced developer experience
- **Vite** – Fast build tool and dev server
- **Tailwind CSS** – Utility-first styling
- **clsx** – Conditional classNames
- *(See package.json for full dependency list)*

## Features

- Visualize BFS, DFS, Dijkstra, A*, and Greedy Best-First Search
- Interactive grid for setting walls, start, and end nodes
- Adjustable animation speed
- Modern UI with HUD and toolbars

## Getting Started

```bash
npm install
npm run dev
```

## Screenshots

*(Screenshots of grid, HUD, algorithm in action, etc. will go here when its finished lol)*

## Planned Improvements / TODO

> **Note: This section is primarily for personal project tracking and may not represent current public features.*

- [ ] Maze generation algorithms (e.g., recursive division, Prim's, Kruskal's)
- [ ] Animation playback slider (scrub through algorithm progress)
- [ ] Brighter HUD (improved contrast/UI visibility)
- [ ] Visualization on real maps (OpenStreetMap or other APIs)
- [ ] Light mode/dark mode toggle
- [ ] Speed slider (for continuous animation rate adjustment)
- [ ] Improved initial placement for start/end nodes
- [ ] Sidebar for advanced controls (heuristic selection, options, etc.)
    - [ ] Heuristic switch (Manhattan ↔ Euclidean)
    - [ ] Toggle diagonal movement
    - [ ] Weighted mode for Dijkstra's and similar algorithms
- [ ] Algorithm insights sidebar or modal (explain properties like "greedy", "guaranteed shortest path", etc.)

---

## License

MIT (see LICENSE)
