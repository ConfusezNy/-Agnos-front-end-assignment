// ============================================================
// Instrumentation — Auto-start WebSocket server in development
// Next.js calls register() once when the server starts.
// In production (Vercel), the API route handles WebSocket.
// In development, we spin up a local WS server on port 3001.
// ============================================================

export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NODE_ENV === 'development'
  ) {
    // Dynamically import to avoid bundling ws in production
    const { startDevWebSocketServer } = await import('@/lib/dev-ws');
    startDevWebSocketServer();
  }
}
