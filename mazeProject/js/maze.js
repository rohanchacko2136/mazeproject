class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.start = { x: 1, y: 1 };
        this.end = { x: width - 2, y: height - 2 };
        this.initGrid();
    }

    initGrid() {
        // Initialize grid with walls
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1; // 1 represents wall
            }
        }
    }

    generate() {
        this.initGrid();
        const stack = [];
        const startX = 1;
        const startY = 1;
        
        // Create path at start position
        this.grid[startY][startX] = 0;
        stack.push([startX, startY]);

        while (stack.length > 0) {
            const [currentX, currentY] = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(currentX, currentY);

            if (neighbors.length === 0) {
                stack.pop();
            } else {
                const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.grid[nextY][nextX] = 0;
                this.grid[currentY + (nextY - currentY) / 2][currentX + (nextX - currentX) / 2] = 0;
                stack.push([nextX, nextY]);
            }
        }

        // Ensure start and end points are paths
        this.grid[this.start.y][this.start.x] = 0;
        this.grid[this.end.y][this.end.x] = 0;

        return this.grid;
    }

    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [0, -2], // Up
            [2, 0],  // Right
            [0, 2],  // Down
            [-2, 0]  // Left
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (newX > 0 && newX < this.width - 1 && 
                newY > 0 && newY < this.height - 1 && 
                this.grid[newY][newX] === 1) {
                neighbors.push([newX, newY]);
            }
        }

        return neighbors;
    }

    isWall(x, y) {
        return this.grid[y][x] === 1;
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && !this.isWall(x, y);
    }
} 