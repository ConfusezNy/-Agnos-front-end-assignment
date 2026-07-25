// ============================================================
// WebSocket Endpoint — Vercel Functions (Production)
// Uses @vercel/functions experimental_upgradeWebSocket.
// For local dev with `next dev`, instrumentation.ts handles WS separately.
// ============================================================

import { experimental_upgradeWebSocket } from '@vercel/functions';
import { WebSocketHub } from '@/lib/ws-handler';

// Single hub instance per Vercel Function container (Fluid Compute keeps it alive)
const hub = new WebSocketHub();

export async function GET() {
  const clientId = hub.generateSessionId();

  return experimental_upgradeWebSocket((ws) => {
    hub.addClient(clientId, ws);

    ws.on('message', (data) => {
      hub.handleMessage(clientId, String(data));
    });

    ws.on('close', () => {
      hub.handleDisconnect(clientId);
    });

    ws.on('error', () => {
      hub.handleDisconnect(clientId);
    });
  });
}
