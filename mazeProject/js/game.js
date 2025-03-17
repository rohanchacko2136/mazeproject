class Game {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 20;
        this.mazeWidth = 31; // Must be odd
        this.mazeHeight = 31; // Must be odd
        this.maze = new Maze(this.mazeWidth, this.mazeHeight);
        this.playerPos = { x: this.maze.start.x, y: this.maze.start.y };
        this.path = null;
        this.pathIndex = 0;
        this.isAnimating = false;
        
        // Timer properties
        this.startTime = null;
        this.currentTime = 0;
        this.timerInterval = null;
        this.hasStartedMoving = false;
        
        // Time Attack mode properties
        this.gameMode = this.getGameMode();
        this.timeLimit = this.getInitialTimeLimit();
        this.countdownInterval = null;
        
        // New properties for smooth movement
        this.moveSpeed = 0.1;
        this.currentPos = { x: this.maze.start.x, y: this.maze.start.y };
        this.targetPos = { x: this.maze.start.x, y: this.maze.start.y };
        this.isMoving = false;
        this.pressedKeys = new Set();
        this.lastFrameTime = 0;

        // Dynamic mode properties
        this.movingWalls = [];
        this.wallUpdateInterval = null;
        this.lastWallUpdate = 0;
        this.wallUpdateDelay = 1000; // Update walls every second

        this.initCanvas();
        this.setupEventListeners();
        this.generateNewMaze();
        this.gameLoop();
        this.updateTimerDisplay();
    }

    getGameMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type') || 'classic';
    }

    getInitialTimeLimit() {
        const savedLimit = localStorage.getItem('timeAttackLimit');
        return savedLimit ? parseInt(savedLimit) : 120; // Start with 2 minutes
    }

    updateTimerDisplay() {
        if (this.gameMode === 'timed') {
            document.getElementById('timer').textContent = `Time Left: ${this.formatTime(this.timeLimit)}`;
        } else {
            document.getElementById('timer').textContent = `Time: ${this.formatTime(this.currentTime)}`;
        }
    }

    initCanvas() {
        this.canvas.width = this.mazeWidth * this.cellSize;
        this.canvas.height = this.mazeHeight * this.cellSize;
    }

    setupEventListeners() {
        document.getElementById('generateMaze').addEventListener('click', () => this.generateNewMaze());
        document.getElementById('solveMaze').addEventListener('click', () => this.solveMaze());
        document.getElementById('resetMaze').addEventListener('click', () => this.resetPlayer());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];
        if (validKeys.includes(e.key)) {
            e.preventDefault();
            this.pressedKeys.add(e.key);
        }
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.key);
    }

    startTimer() {
        if (!this.hasStartedMoving) {
            this.hasStartedMoving = true;
            this.startTime = Date.now();
            
            if (this.gameMode === 'timed') {
                // Start countdown for Time Attack mode
                this.countdownInterval = setInterval(() => {
                    this.timeLimit--;
                    this.updateTimerDisplay();
                    
                    if (this.timeLimit <= 0) {
                        this.gameOver();
                    }
                }, 1000);
            } else {
                // Regular timer for other modes
                this.timerInterval = setInterval(() => {
                    this.currentTime = Math.floor((Date.now() - this.startTime) / 1000);
                    this.updateTimerDisplay();
                }, 1000);
            }
        }
    }

    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.currentTime = 0;
        this.hasStartedMoving = false;
        this.startTime = null;
        this.updateTimerDisplay();
    }

    saveTime() {
        const mode = this.gameMode;
        const times = JSON.parse(localStorage.getItem(`mazeTimes_${mode}`) || '[]');
        times.push(this.currentTime);
        times.sort((a, b) => a - b); // Sort times ascending
        localStorage.setItem(`mazeTimes_${mode}`, JSON.stringify(times.slice(0, 5))); // Keep top 5 times
    }

    formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    gameOver() {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        
        const modal = document.createElement('div');
        modal.className = 'win-modal';
        modal.innerHTML = `
            <div class="win-content">
                <h2>Time's Up!</h2>
                <p class="completion-time">You didn't make it in time!</p>
                <div class="win-buttons">
                    <button onclick="window.location.reload()">Try Again</button>
                    <button onclick="window.location.href='index.html'">Main Menu</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showWinScreen() {
        // Stop the timer
        if (this.gameMode === 'timed') {
            clearInterval(this.countdownInterval);
            // Decrease time limit for next attempt
            this.timeLimit = Math.max(30, this.timeLimit - 10); // Don't go below 30 seconds
            localStorage.setItem('timeAttackLimit', this.timeLimit);
        } else {
            clearInterval(this.timerInterval);
            this.saveTime();
        }
        
        // Get previous times for the current mode
        const mode = this.gameMode;
        const times = JSON.parse(localStorage.getItem(`mazeTimes_${mode}`) || '[]');
        const timesList = times.map((time, index) => 
            `<li><span class="rank">#${index + 1}</span> <span class="time">${this.formatTime(time)}</span></li>`
        ).join('');

        // Get mode-specific title
        const modeTitle = {
            'classic': 'Classic Mode',
            'dynamic': 'Dynamic Mode',
            'timed': 'Time Attack Mode'
        }[mode] || 'Maze Game';

        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'win-modal';
        modal.innerHTML = `
            <div class="win-content">
                <h2>Congratulations!</h2>
                <p class="mode-title">${modeTitle}</p>
                <p class="completion-time">Time: ${this.formatTime(this.gameMode === 'timed' ? this.timeLimit : this.currentTime)}</p>
                ${this.gameMode !== 'timed' ? `
                    <div class="best-times">
                        <h3>Best Times - ${modeTitle}</h3>
                        <ul class="times-list">${timesList}</ul>
                    </div>
                ` : ''}
                <div class="win-buttons">
                    <button onclick="window.location.reload()">Play Again</button>
                    <button onclick="window.location.href='index.html'">Main Menu</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generateNewMaze() {
        this.maze.generate();
        this.resetPlayer();
        this.resetTimer();
        if (this.gameMode === 'dynamic') {
            this.initializeMovingWalls();
        }
        this.draw();
    }

    initializeMovingWalls() {
        this.movingWalls = [];
        const wallSpeed = 2.0; // Increased consistent speed for all walls
        // Create more moving wall segments
        for (let i = 0; i < 8; i++) {
            this.movingWalls.push({
                x: Math.floor(Math.random() * (this.mazeWidth - 2)) + 1,
                y: Math.floor(Math.random() * (this.mazeHeight - 2)) + 1,
                length: Math.floor(Math.random() * 3) + 2, // 2-4 cells long
                direction: Math.random() < 0.5 ? 'horizontal' : 'vertical',
                speed: wallSpeed * (Math.random() < 0.5 ? 1 : -1), // Consistent speed, random direction
                durability: 5, // Walls break after 5 hits
                offset: Math.random() * 2 - 1 // -1 to 1
            });
        }
    }

    updateMovingWalls() {
        if (this.gameMode !== 'dynamic') return;

        const currentTime = Date.now();
        if (currentTime - this.lastWallUpdate < this.wallUpdateDelay) return;
        this.lastWallUpdate = currentTime;

        // Filter out broken walls
        this.movingWalls = this.movingWalls.filter(wall => wall.durability > 0);

        this.movingWalls.forEach(wall => {
            // Store old position
            const oldX = wall.x;
            const oldY = wall.y;

            // Update wall position
            if (wall.direction === 'horizontal') {
                wall.x += wall.speed;
                // Bounce off edges
                if (wall.x < 1 || wall.x + wall.length > this.mazeWidth - 1) {
                    wall.speed *= -1;
                }
            } else {
                wall.y += wall.speed;
                // Bounce off edges
                if (wall.y < 1 || wall.y + wall.length > this.mazeHeight - 1) {
                    wall.speed *= -1;
                }
            }

            // Ensure walls stay within bounds
            wall.x = Math.max(1, Math.min(wall.x, this.mazeWidth - wall.length - 1));
            wall.y = Math.max(1, Math.min(wall.y, this.mazeHeight - wall.length - 1));

            // Check if player is in the path of the moving wall
            if (this.isPlayerInWallPath(wall)) {
                // Revert wall position if it would hit player
                wall.x = oldX;
                wall.y = oldY;
                wall.speed *= -1;
                // Decrease durability when player hits the wall
                wall.durability--;
                // Force wall to move in opposite direction after hit
                wall.speed = Math.abs(wall.speed) * (wall.speed > 0 ? -1 : 1);
            }

            // Check if wall is blocking the path to the end
            const pathfinder = new AStar(this.maze);
            const path = pathfinder.findPath(this.maze.start, this.maze.end);
            if (!path) {
                // If path is blocked, reverse wall direction
                wall.speed *= -1;
            }
        });
    }

    isPlayerInWallPath(wall) {
        const playerX = Math.floor(this.currentPos.x);
        const playerY = Math.floor(this.currentPos.y);

        if (wall.direction === 'horizontal') {
            return playerY === wall.y && 
                   playerX >= wall.x && 
                   playerX < wall.x + wall.length;
        } else {
            return playerX === wall.x && 
                   playerY >= wall.y && 
                   playerY < wall.y + wall.length;
        }
    }

    isWall(x, y) {
        if (this.gameMode !== 'dynamic') {
            return this.maze.isWall(x, y);
        }

        // Check static walls first
        if (this.maze.isWall(x, y)) return true;

        // Check moving walls
        return this.movingWalls.some(wall => {
            if (wall.direction === 'horizontal') {
                return y === wall.y && x >= wall.x && x < wall.x + wall.length;
            } else {
                return x === wall.x && y >= wall.y && y < wall.y + wall.length;
            }
        });
    }

    resetPlayer() {
        this.playerPos = { x: this.maze.start.x, y: this.maze.start.y };
        this.currentPos = { ...this.playerPos };
        this.targetPos = { ...this.playerPos };
        this.path = null;
        this.pathIndex = 0;
        this.isAnimating = false;
        this.resetTimer();
        if (this.gameMode === 'dynamic') {
            this.initializeMovingWalls();
        }
        this.draw();
    }

    processInput() {
        if (this.isAnimating || this.isMoving) return;

        const moves = {
            'ArrowUp': { dx: 0, dy: -1 },
            'ArrowRight': { dx: 1, dy: 0 },
            'ArrowDown': { dx: 0, dy: 1 },
            'ArrowLeft': { dx: -1, dy: 0 },
            'w': { dx: 0, dy: -1 },
            'd': { dx: 1, dy: 0 },
            's': { dx: 0, dy: 1 },
            'a': { dx: -1, dy: 0 }
        };

        for (const key of this.pressedKeys) {
            const move = moves[key];
            if (move) {
                const newX = this.playerPos.x + move.dx;
                const newY = this.playerPos.y + move.dy;

                // Check if the new position is valid and not a wall
                if (newX >= 0 && newX < this.mazeWidth && 
                    newY >= 0 && newY < this.mazeHeight && 
                    !this.isWall(newX, newY)) {
                    
                    // Start timer on first valid move
                    if (!this.hasStartedMoving) {
                        this.startTimer();
                    }
                    
                    this.targetPos = { x: newX, y: newY };
                    this.playerPos = { x: newX, y: newY };
                    this.isMoving = true;

                    if (newX === this.maze.end.x && newY === this.maze.end.y) {
                        this.showWinScreen();
                    }
                    break;
                }
            }
        }
    }

    updatePosition(deltaTime) {
        if (!this.isMoving) return;

        const dx = this.targetPos.x - this.currentPos.x;
        const dy = this.targetPos.y - this.currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.01) {
            this.currentPos = { ...this.targetPos };
            this.isMoving = false;
            return;
        }

        const moveAmount = this.moveSpeed * deltaTime;
        const ratio = Math.min(moveAmount / distance, 1);

        // Check if the next position would hit a wall
        const nextX = this.currentPos.x + dx * ratio;
        const nextY = this.currentPos.y + dy * ratio;
        
        if (!this.isWall(Math.floor(nextX), Math.floor(nextY))) {
            this.currentPos.x = nextX;
            this.currentPos.y = nextY;
        } else {
            this.isMoving = false;
            this.currentPos = { ...this.targetPos };
        }
    }

    gameLoop(timestamp = 0) {
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        this.processInput();
        this.updatePosition(deltaTime);
        this.updateMovingWalls();
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    async solveMaze() {
        if (this.isAnimating) return;

        const pathfinder = new AStar(this.maze);
        this.path = pathfinder.findPath(this.maze.start, this.maze.end);
        
        if (this.path) {
            this.isAnimating = true;
            this.pathIndex = 0;
            await this.animateSolution();
        }
    }

    async animateSolution() {
        if (this.pathIndex < this.path.length) {
            this.playerPos = this.path[this.pathIndex];
            this.currentPos = { ...this.playerPos };
            this.targetPos = { ...this.playerPos };
            this.draw();
            this.pathIndex++;
            await new Promise(resolve => setTimeout(resolve, 50));
            requestAnimationFrame(() => this.animateSolution());
        } else {
            this.isAnimating = false;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw static maze walls
        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                if (this.maze.isWall(x, y)) {
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        // Draw moving walls in dynamic mode
        if (this.gameMode === 'dynamic') {
            this.movingWalls.forEach(wall => {
                // Calculate opacity based on durability
                const opacity = wall.durability / 5;
                this.ctx.fillStyle = `rgba(231, 76, 60, ${opacity})`; // Red color with varying opacity
                
                if (wall.direction === 'horizontal') {
                    this.ctx.fillRect(
                        wall.x * this.cellSize,
                        wall.y * this.cellSize,
                        wall.length * this.cellSize,
                        this.cellSize
                    );
                } else {
                    this.ctx.fillRect(
                        wall.x * this.cellSize,
                        wall.y * this.cellSize,
                        this.cellSize,
                        wall.length * this.cellSize
                    );
                }
            });
        }

        // Draw start point
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(
            this.maze.start.x * this.cellSize,
            this.maze.start.y * this.cellSize,
            this.cellSize,
            this.cellSize
        );

        // Draw end point
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(
            this.maze.end.x * this.cellSize,
            this.maze.end.y * this.cellSize,
            this.cellSize,
            this.cellSize
        );

        // Draw player with smooth position
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(
            this.currentPos.x * this.cellSize + this.cellSize / 2,
            this.currentPos.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw solution path
        if (this.path && this.pathIndex > 0) {
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.path[0].x * this.cellSize + this.cellSize / 2,
                this.path[0].y * this.cellSize + this.cellSize / 2
            );

            for (let i = 1; i < this.pathIndex; i++) {
                this.ctx.lineTo(
                    this.path[i].x * this.cellSize + this.cellSize / 2,
                    this.path[i].y * this.cellSize + this.cellSize / 2
                );
            }
            this.ctx.stroke();
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 