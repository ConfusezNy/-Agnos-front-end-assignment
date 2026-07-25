// ============================================================
// Development WebSocket Server
// Auto-started by instrumentation.ts when running `next dev`.
// ============================================================

import { WebSocketServer } from 'ws';
import { WebSocketHub } from './ws-handler';

const hub = new WebSocketHub();
let serverStarted = false;

/**
 * Starts the WebSocket server on port 3001.
 * Called once by instrumentation.ts during dev server startup.
 */
export function startDevWebSocketServer(): void {
  if (serverStarted) return;
  serverStarted = true;

  const PORT = 3001;
  const wss = new WebSocketServer({ port: PORT });

  wss.on('listening', () => {
    console.log(`  ▶ WebSocket server ready on ws://localhost:${PORT}`);
  });

  wss.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  ▶ WebSocket server already running on port ${PORT}`);
    }
    // Don't crash — just skip if port is taken
  });

  wss.on('connection', (ws) => {
    const clientId = hub.generateSessionId();
    hub.addClient(clientId, ws);

    ws.on('message', (data) => hub.handleMessage(clientId, data.toString()));

    ws.on('close', () => hub.handleDisconnect(clientId));

    ws.on('error', () => hub.handleDisconnect(clientId));
  });
}
