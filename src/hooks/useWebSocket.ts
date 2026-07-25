'use client';

// ============================================================
// useWebSocket Hook — WebSocket connection with auto-reconnect
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ClientMessage, ServerMessage } from '@/lib/types';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketOptions {
  role: 'patient' | 'staff';
  onMessage: (message: ServerMessage) => void;
}

interface UseWebSocketReturn {
  send: (message: ClientMessage) => void;
  connectionState: ConnectionState;
  isConnected: boolean;
}

/**
 * Determines the WebSocket URL based on the current environment.
 * - Production (Vercel): wss://domain/api/ws
 * - Local dev: ws://localhost:3001
 */
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') return '';

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (isDev) {
    return `ws://localhost:3001`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/ws`;
}

export function useWebSocket({
  role,
  onMessage,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(1000);
  const mountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);
  const roleRef = useRef(role);

  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');

  // Keep refs up to date
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const url = getWebSocketUrl();
    if (!url) return;

    setConnectionState('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }

        setConnectionState('connected');
        reconnectDelayRef.current = 1000; // Reset backoff

        // Generate a persistent tab ID (unique per browser tab, survives navigation)
        let tabId = sessionStorage.getItem('ws-tab-id');
        if (!tabId) {
          tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          sessionStorage.setItem('ws-tab-id', tabId);
        }

        // Register with role + tabId for deduplication
        ws.send(JSON.stringify({ type: 'register', role: roleRef.current, tabId }));
      });

      ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as ServerMessage;
          onMessageRef.current(message);
        } catch {
          // Invalid JSON, ignore
        }
      });

      ws.addEventListener('close', () => {
        if (!mountedRef.current) return;

        setConnectionState('disconnected');
        wsRef.current = null;

        // Reconnect with exponential backoff
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            reconnectDelayRef.current * 2,
            30000
          );
          connect();
        }, reconnectDelayRef.current);
      });

      ws.addEventListener('error', () => {
        // Close event will fire after error, triggering reconnect
        ws.close();
      });
    } catch {
      // Failed to create WebSocket, retry
      setConnectionState('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 2,
          30000
        );
        connect();
      }, reconnectDelayRef.current);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    mountedRef.current = true;
    connect();

    // Close WS immediately when navigating away (prevents ghost sessions)
    const handleBeforeUnload = () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'page-unload');
        wsRef.current = null;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'unmount');
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    send,
    connectionState,
    isConnected: connectionState === 'connected',
  };
}
