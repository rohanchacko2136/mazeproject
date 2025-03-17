import { useState, useEffect } from 'react';
import { initWebSocket } from '../services/websocket';

export function useMultiplayer(gameType) {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const connect = async () => {
    const ws = await initWebSocket(gameType);
    setSocket(ws);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'gameState':
          setGameState(data.state);
          break;
        case 'players':
          setPlayers(data.players);
          break;
        case 'host':
          setIsHost(data.isHost);
          break;
      }
    };
  };

  const sendMove = (move) => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'move',
        move
      }));
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  return { connect, disconnect, sendMove, gameState, players, isHost };
} 