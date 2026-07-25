// ============================================================
// WebSocket Endpoint — Vercel Functions
// This route only works on Vercel (production) or with `vercel dev`.
// For local dev with `next dev`, the WS server in instrumentation.ts handles it.
// ============================================================

import { connection } from 'next/server';
import { experimental_upgradeWebSocket } from '@vercel/functions';
import { WebSocketHub } from '@/lib/ws-handler';

// Single hub instance per Vercel Function container
const hub = new WebSocketHub();

export async function GET() {
  // Opt out of static prerendering (required for WebSocket routes)
  await connection();

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
