import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './utils/constants/env';
import { socketAuth } from './middleware/socket-auth.middleware';
import { registerLobbyHandlers } from './socket/lobby.socket';
import { registerGameHandlers } from './socket/game.socket';

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true, // allows cookies to be sent with the WebSocket handshake
  },
});

io.use(socketAuth); // runs on every new connection before any event handlers

io.on('connection', (socket) => {
  registerLobbyHandlers(io, socket);
  registerGameHandlers(io, socket);
});

httpServer.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
