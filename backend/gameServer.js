const WebSocket = require('ws');

class GameServer {
  constructor() {
    this.games = new Map(); // gameId -> game state
    this.players = new Map(); // playerId -> socket
  }

  handleConnection(socket, gameType) {
    const gameId = this.createOrJoinGame(gameType);
    
    socket.on('message', (data) => {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'move':
          this.handleMove(gameId, socket.playerId, message.move);
          break;
        // Handle other message types
      }
    });
  }

  handleMove(gameId, playerId, move) {
    const game = this.games.get(gameId);
    // Update game state
    const newState = this.updateGameState(game, playerId, move);
    
    // Broadcast to all players in the game
    this.broadcastGameState(gameId, newState);
  }
} 