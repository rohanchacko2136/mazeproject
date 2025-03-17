import { useEffect } from 'react';
import { moveSnake, checkCollision } from './SnakeLogic';

export default function SnakeGame({ multiplayer, onMove, gameState }) {
  // Use local state for single player, gameState for multiplayer
  const state = multiplayer ? gameState : useLocalGameState();

  const handleMove = (direction) => {
    if (multiplayer) {
      onMove({ type: 'move', direction });
    } else {
      // Local game logic
      moveSnake(direction);
    }
  };

  return (
    <div>
      {/* Game UI */}
      {multiplayer && (
        <div className="player-list">
          {gameState.players.map(player => (
            <div key={player.id}>
              Player {player.id}: {player.score}
            </div>
          ))}
        </div>
      )}
      {/* Game board */}
    </div>
  );
} 