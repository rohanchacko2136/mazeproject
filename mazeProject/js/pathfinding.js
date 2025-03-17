class Node {
    constructor(x, y, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.g = g; // Cost from start to current node
        this.h = h; // Heuristic cost from current node to end
        this.f = g + h; // Total cost
        this.parent = null;
    }
}

class AStar {
    constructor(maze) {
        this.maze = maze;
        this.openSet = [];
        this.closedSet = new Set();
    }

    heuristic(node, goal) {
        // Manhattan distance
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
    }

    getNeighbors(node) {
        const directions = [
            [0, -1], // Up
            [1, 0],  // Right
            [0, 1],  // Down
            [-1, 0]  // Left
        ];

        return directions
            .map(([dx, dy]) => ({
                x: node.x + dx,
                y: node.y + dy
            }))
            .filter(({x, y}) => this.maze.isValidPosition(x, y));
    }

    findPath(start, end) {
        this.openSet = [new Node(start.x, start.y, 0, this.heuristic({x: start.x, y: start.y}, end))];
        this.closedSet.clear();

        while (this.openSet.length > 0) {
            // Get node with lowest f score
            let currentIndex = 0;
            for (let i = 1; i < this.openSet.length; i++) {
                if (this.openSet[i].f < this.openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }

            const current = this.openSet[currentIndex];

            // Check if we reached the end
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(current);
            }

            // Move current node from open to closed set
            this.openSet.splice(currentIndex, 1);
            this.closedSet.add(`${current.x},${current.y}`);

            // Check all neighbors
            for (const neighbor of this.getNeighbors(current)) {
                if (this.closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    continue;
                }

                const gScore = current.g + 1;
                const neighborNode = new Node(
                    neighbor.x,
                    neighbor.y,
                    gScore,
                    this.heuristic(neighbor, end)
                );
                neighborNode.parent = current;

                const openNode = this.openSet.find(node => 
                    node.x === neighbor.x && node.y === neighbor.y
                );

                if (!openNode) {
                    this.openSet.push(neighborNode);
                } else if (gScore < openNode.g) {
                    openNode.g = gScore;
                    openNode.f = gScore + openNode.h;
                    openNode.parent = current;
                }
            }
        }

        return null; // No path found
    }

    reconstructPath(endNode) {
        const path = [];
        let current = endNode;

        while (current) {
            path.unshift({x: current.x, y: current.y});
            current = current.parent;
        }

        return path;
    }
} 