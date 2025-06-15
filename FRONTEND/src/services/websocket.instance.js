import { WebSocketService } from './websocket.service';

// Create a singleton instance for the WebSocket service
let websocketInstance = null;

export const getWebSocketInstance = () => {
  if (!websocketInstance) {
    websocketInstance = new WebSocketService();
  }
  return websocketInstance;
};

export const resetWebSocketInstance = () => {
  if (websocketInstance) {
    websocketInstance.disconnect();
    websocketInstance = null;
  }
};
