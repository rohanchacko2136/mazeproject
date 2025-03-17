import { useState, useEffect } from 'react';
import { useMultiplayer } from '../../../hooks/useMultiplayer';

export default function GameWrapper({ GameComponent, gameType }) {
  const [gameMode, setGameMode] = useState('single'); // 'single' or 'multi'
  const { 
    connect,
    disconnect,
    sendMove,
    gameState,
    players,
    isHost
  } = useMultiplayer(gameType);

  return (
    <div className="game-wrapper">
      <div className="game-controls">
        <button 
          onClick={() => setGameMode(gameMode === 'single' ? 'multi' : 'single')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {gameMode === 'single' ? 'Play Multiplayer' : 'Play Solo'}
        </button>
      </div>

      {gameMode === 'multi' && (
        <MultiplayerLobby 
          players={players}
          isHost={isHost}
          onStart={() => {/* start game logic */}}
        />
      )}

      <GameComponent 
        multiplayer={gameMode === 'multi'}
        onMove={sendMove}
        gameState={gameState}
      />
    </div>
  );
} 