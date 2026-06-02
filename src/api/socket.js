import { io } from 'socket.io-client';

var SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

var socket = null;

var connectSocket = function (token) {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', function () { console.log('[VIBE] Socket connected:', socket.id); });
  socket.on('disconnect', function (reason) { console.log('[VIBE] Socket disconnected:', reason); });
  socket.on('connect_error', function (err) { console.warn('[VIBE] Socket error:', err.message); });

  return socket;
};

var disconnectSocket = function () {
  if (socket) { socket.disconnect(); socket = null; }
};

var getSocket = function () { return socket; };

export { connectSocket, disconnectSocket, getSocket };