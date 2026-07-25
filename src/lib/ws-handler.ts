// ============================================================
// Shared WebSocket Handler — Single source of truth for all
// message handling, session management, and broadcasting logic.
// Used by both the dev server (dev-ws.ts) and Vercel route (route.ts).
// ============================================================

import type {
  PatientSession,
  ClientMessage,
  ServerMessage,
} from './types';
import { EMPTY_FORM_DATA } from './types';

/**
 * Minimal WebSocket interface that both `ws` (dev) and
 * Vercel's WebSocket (prod) satisfy.
 */
export interface GenericWebSocket {
  send(data: string): void;
  readyState: number;
}

interface ConnectedClient {
  ws: GenericWebSocket;
  role: 'patient' | 'staff';
  sessionId: string;
  tabId?: string;
}

/**
 * Manages all connected clients and patient sessions.
 * One instance per server process / function container.
 */
export class WebSocketHub {
  private clients = new Map<string, ConnectedClient>();
  private patientSessions = new Map<string, PatientSession>();
  private sessionCounter = 0;

  /** Generate a unique session ID for a new connection. */
  generateSessionId(): string {
    this.sessionCounter += 1;
    return `patient-${Date.now()}-${this.sessionCounter}`;
  }

  /** Register a WebSocket connection in the hub. */
  addClient(clientId: string, ws: GenericWebSocket): void {
    this.clients.set(clientId, { ws, role: 'patient', sessionId: clientId });
  }

  /** Send a typed message to a single socket (safe — ignores closed sockets). */
  private sendToClient(ws: GenericWebSocket, message: ServerMessage): void {
    try {
      // readyState 1 === OPEN (works for both `ws` lib and Vercel)
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(message));
      }
    } catch {
      // Connection already closed — ignore
    }
  }

  /** Broadcast a message to every connected staff client. */
  private broadcastToStaff(message: ServerMessage): void {
    this.clients.forEach((client) => {
      if (client.role === 'staff') {
        this.sendToClient(client.ws, message);
      }
    });
  }

  /**
   * Remove any existing patient session from the same browser tab.
   * This prevents ghost sessions when the user navigates away and back.
   */
  private deduplicateByTabId(tabId: string, currentClientId: string): void {
    const toRemove: string[] = [];
    this.clients.forEach((client, id) => {
      if (
        id !== currentClientId &&
        client.role === 'patient' &&
        client.tabId === tabId
      ) {
        // Don't remove already-submitted sessions — keep them visible on staff dashboard
        const existingSession = this.patientSessions.get(client.sessionId);
        if (existingSession?.status === 'submitted') return;

        toRemove.push(id);
      }
    });
    for (const id of toRemove) {
      const old = this.clients.get(id);
      if (old) {
        this.patientSessions.delete(old.sessionId);
        this.broadcastToStaff({ type: 'patient:disconnected', sessionId: old.sessionId });
        this.clients.delete(id);
      }
    }
  }


  /**
   * Prune stale connections whose sockets are no longer open.
   */
  private pruneStaleClients(): void {
    const staleIds: string[] = [];
    this.clients.forEach((client, id) => {
      if (client.ws.readyState !== 1) {
        staleIds.push(id);
      }
    });
    for (const id of staleIds) {
      this.handleDisconnect(id);
    }
  }

  /** Process an incoming message from a client. */
  handleMessage(clientId: string, raw: string): void {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }

    const client = this.clients.get(clientId);
    if (!client) return;

    switch (msg.type) {
      case 'register': {
        // Clean up stale connections
        this.pruneStaleClients();

        client.role = msg.role;

        if (msg.role === 'patient') {
          // Deduplicate: if this tab already has a session, remove the old one
          if (msg.tabId) {
            client.tabId = msg.tabId;
            this.deduplicateByTabId(msg.tabId, clientId);
          }

          const session: PatientSession = {
            id: client.sessionId,
            data: { ...EMPTY_FORM_DATA },
            status: 'filling',
            connectedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          };
          this.patientSessions.set(client.sessionId, session);
          this.sendToClient(client.ws, { type: 'connection:ack', sessionId: client.sessionId });
          this.broadcastToStaff({ type: 'patient:updated', patient: session });
        } else if (msg.role === 'staff') {
          this.sendToClient(client.ws, { type: 'connection:ack', sessionId: client.sessionId });
          this.sendToClient(client.ws, {
            type: 'patients:sync',
            patients: Array.from(this.patientSessions.values()),
          });
        }
        break;
      }

      case 'patient:update': {
        const session = this.patientSessions.get(client.sessionId);
        if (session) {
          session.data = msg.data;
          session.lastActivity = new Date().toISOString();
          session.status = 'filling';
          this.broadcastToStaff({ type: 'patient:updated', patient: session });
        }
        break;
      }

      case 'patient:status': {
        const session = this.patientSessions.get(client.sessionId);
        if (session) {
          session.status = msg.status;
          session.lastActivity = new Date().toISOString();
          this.broadcastToStaff({
            type: 'patient:status-changed',
            sessionId: client.sessionId,
            status: msg.status,
          });
        }
        break;
      }
    }
  }

  /** Handle client disconnection (close or error). */
  handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.role === 'patient') {
      const session = this.patientSessions.get(client.sessionId);

      if (session && session.status === 'submitted') {
        // Keep submitted sessions visible on staff dashboard — don't delete them
        // Staff should still see submitted patient data after patient closes tab
        // (session remains in patientSessions Map but client socket is removed)
      } else {
        // Non-submitted patients: remove session and notify staff
        this.patientSessions.delete(client.sessionId);
        this.broadcastToStaff({ type: 'patient:disconnected', sessionId: client.sessionId });
      }
    }

    this.clients.delete(clientId);
  }
}

