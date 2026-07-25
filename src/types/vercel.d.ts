// Type declarations for Vercel WebSocket API
// This function is injected by Vercel's runtime — not in the npm package.
// It is only available when deployed on Vercel or when using `vercel dev`.

declare module '@vercel/functions' {
  export interface WebSocketData {
    toString(): string;
  }

  export interface VercelWebSocket {
    send(data: string | ArrayBuffer | Uint8Array): void;
    close(): void;
    on(event: 'message', handler: (data: WebSocketData) => void): void;
    on(event: 'close', handler: () => void): void;
    on(event: 'error', handler: (error: Error) => void): void;
    readyState: number;
  }

  export function experimental_upgradeWebSocket(
    handler: (ws: VercelWebSocket) => void
  ): Response;

  export function geolocation(request: Request): Record<string, string>;
  export function ipAddress(input: Request | Headers): string | undefined;
  export function waitUntil(promise: Promise<unknown>): void;
  export function getEnv(key: string): string | undefined;
}
