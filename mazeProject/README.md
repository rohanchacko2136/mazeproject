# Maze Pathfinding Game

A web-based maze game where players can navigate through randomly generated mazes or watch an AI solve them using the A* pathfinding algorithm.

## Features

- Random maze generation using a depth-first search algorithm
- Player movement using arrow keys or WASD
- AI pathfinding using the A* algorithm
- Interactive controls for generating new mazes and solving them
- Responsive canvas-based rendering
- Three game modes:
  - Classic Mode: Standard maze solving
  - Dynamic Mode: Moving walls that can be broken
  - Time Attack Mode: Race against the clock

## How to Play

1. Open `index.html` in a modern web browser
2. Choose your preferred game mode
3. Use the arrow keys or WASD to navigate the blue player from the green start point to the red end point
4. Click "Generate New Maze" to create a new random maze
5. Click "Solve with AI" to watch the A* algorithm find the shortest path
6. Click "Reset" to return the player to the start position

## Controls

- **Arrow Keys or WASD**: Move the player
- **Generate New Maze**: Creates a new random maze
- **Solve with AI**: Demonstrates the A* pathfinding algorithm
- **Reset**: Returns the player to the starting position

## Game Modes

### Classic Mode
- Standard maze solving experience
- Track your best completion times
- Watch the AI solve the maze using A*

### Dynamic Mode
- Moving walls that can be broken
- Each wall has 5 durability points
- Strategic gameplay with dynamic obstacles

### Time Attack Mode
- Race against the clock
- Time limit decreases with each successful completion
- Test your speed and efficiency

## Technical Details

The project consists of three main components:

1. **Maze Generation**: Uses a randomized depth-first search algorithm to create perfect mazes
2. **AI Pathfinding**: Implements the A* algorithm to find the optimal path from start to end
3. **Game Logic**: Handles player movement, rendering, and user interface

## Implementation

- Pure JavaScript with HTML5 Canvas for rendering
- No external dependencies required
- Modular code structure with separate classes for maze generation, pathfinding, and game logic
- Local storage for saving high scores and game progress 