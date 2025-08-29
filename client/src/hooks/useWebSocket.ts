import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UseWebSocketOptions {
  url?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        onConnect?.();
        
        // Clear any existing reconnect timer
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();
        
        // Attempt to reconnect if enabled
        if (autoReconnect) {
          reconnectTimer.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, onConnect, onDisconnect, onError, autoReconnect, reconnectInterval]);

  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'new-alert':
        // Invalidate alerts queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/alerts/active"] });
        
        // Show toast notification for critical alerts
        if (data.payload?.severity === 'critical') {
          toast({
            title: "Critical Alert",
            description: data.payload.title,
            variant: "destructive",
          });
        }
        break;

      case 'alert-resolved':
        // Invalidate alerts queries
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/alerts/active"] });
        break;

      case 'sensor-reading':
        // Invalidate sensor and analytics queries
        queryClient.invalidateQueries({ queryKey: ["/api/sensors"] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
        break;

      case 'new-report':
        // Invalidate reports queries
        queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
        
        toast({
          title: "New Community Report",
          description: "A new report has been submitted by the community.",
        });
        break;

      case 'notification':
        // Invalidate notifications query
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        
        // Show toast for immediate notifications
        if (data.payload?.priority === 'high') {
          toast({
            title: data.payload.title,
            description: data.payload.message,
            variant: data.payload.type === 'warning' ? 'destructive' : 'default',
          });
        }
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, [queryClient, toast]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Cannot send message:', message);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    disconnect,
    reconnect: connect,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
}
