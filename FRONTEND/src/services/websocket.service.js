import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_CONFIG } from "@/config/api.config";
import { getToken } from "@/imports/localStorage";

export class WebSocketService {
  constructor() {
    this.client = null;
    this.stompSubscriptions = new Map();
    this.interviewId = null;
    this.userId = null;
    this.messageQueue = [];
    this.subscriptionQueue = [];
    this.connecting = false;
    this.connected = false;
    this.messageHandlers = {
      chat: [],
      timer: [],
      participantJoined: [],
      participantLeft: [],
      status: [],
      notes: [],
      signal: [],
      codeUpdate: [],
    };
  }

  connect(interviewId, userId) {
    return new Promise((resolve, reject) => {
      try {
        this.interviewId = interviewId;
        this.userId = userId;
        this.connecting = true;

        if (this.client) {
          this.disconnect();
        }

        const socket = new SockJS(`${API_CONFIG.BASE_URL}/ws`);

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${getToken()}`,
          },
          debug: (str) => {
            console.log("STOMP:", str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
          console.log("STOMP connection established");
          this.connected = true;
          this.connecting = false;

          // Process any queued subscriptions first
          if (this.subscriptionQueue.length > 0) {
            console.log(
              `Processing ${this.subscriptionQueue.length} queued subscriptions`
            );
            this.subscriptionQueue.forEach(({ destination, callback }) => {
              this.subscribe(destination, callback);
            });
            this.subscriptionQueue = [];
          }

          // Now subscribe to standard topics
          this.subscribeToTopics(interviewId);
          this.subscribeToSignaling(interviewId);
          this.joinRoom(interviewId);

          // Process any queued messages
          if (this.messageQueue.length > 0) {
            console.log(
              `Processing ${this.messageQueue.length} queued messages`
            );
            this.messageQueue.forEach(({ destination, body }) => {
              this.sendMessageImmediate(destination, body);
            });
            this.messageQueue = [];
          }

          resolve(frame);
        };

        this.client.onStompError = (frame) => {
          console.error("STOMP error:", frame.headers.message);
          reject(new Error(frame.headers.message));
        };

        this.client.onWebSocketError = (event) => {
          console.error("WebSocket error:", event);
        };

        this.client.onWebSocketClose = () => {
          console.log("WebSocket connection closed");
        };

        this.client.activate();
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.client) {
      // Unsubscribe from all topics
      this.stompSubscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });

      // Clear subscriptions
      this.stompSubscriptions.clear();

      // Disconnect client
      if (this.client.connected) {
        this.client.deactivate();
      }

      this.client = null;
      this.connected = false;
      this.connecting = false;
    }
  }

  subscribeToTopics(interviewId) {
    // Subscribe to chat messages
    this.subscribe(`/topic/interview/${interviewId}/chat`, (message) => {
      try {
        const chatMessage = JSON.parse(message.body);
        this.messageHandlers.chat.forEach((handler) => handler(chatMessage));
      } catch (error) {
        console.error("Error handling chat message:", error);
      }
    });

    // Subscribe to code updates
    this.subscribe(`/topic/interview/${interviewId}/code-update`, (message) => {
      try {
        console.log('Received code update message:', message.body);
        const codeUpdate = JSON.parse(message.body);
        this.messageHandlers.codeUpdate.forEach((handler) => handler(codeUpdate));
      } catch (error) {
        console.error("Error handling code update:", error);
      }
    });

    // Other existing subscriptions...
    this.subscribe(`/topic/interview/${interviewId}/timer`, (message) => {
      try {
        const timerData = JSON.parse(message.body);
        this.messageHandlers.timer.forEach((handler) => handler(timerData));
      } catch (error) {
        console.error("Error handling timer message:", error);
      }
    });

    this.subscribe(
      `/topic/interview/${interviewId}/participants`,
      (message) => {
        try {
          const participantData = JSON.parse(message.body);
          if (participantData.type === "JOIN") {
            this.messageHandlers.participantJoined.forEach((handler) =>
              handler(participantData.participant)
            );
          } else if (participantData.type === "LEAVE") {
            this.messageHandlers.participantLeft.forEach((handler) =>
              handler(participantData.participantId)
            );
          }
        } catch (error) {
          console.error("Error handling participant message:", error);
        }
      }
    );

    this.subscribe(`/topic/interview/${interviewId}/status`, (message) => {
      try {
        const statusData = JSON.parse(message.body);
        this.messageHandlers.status.forEach((handler) => handler(statusData));
      } catch (error) {
        console.error("Error handling status message:", error);
      }
    });

    this.subscribe(`/topic/interview/${interviewId}/notes`, (message) => {
      try {
        const notesData = JSON.parse(message.body);
        this.messageHandlers.notes.forEach((handler) => handler(notesData));
      } catch (error) {
        console.error("Error handling notes message:", error);
      }
    });
  }

  subscribeToSignaling(interviewId) {
    console.log(`Subscribing to signaling for interview ${interviewId}`);
    this.subscribe(`/topic/interview/${interviewId}/signal`, (message) => {
      try {
        const signalData = JSON.parse(message.body);
        console.log("Received signal message:", signalData);

        // Ensure we don't process our own messages
        if (signalData.sender === this.userId) {
          console.log("Ignoring own signal message");
          return;
        }

        this.messageHandlers.signal.forEach((handler) => handler(signalData));
      } catch (error) {
        console.error("Error handling signal message:", error);
      }
    });
  }

  subscribe(destination, callback) {
    if (this.client && this.client.connected) {
      try {
        const subscription = this.client.subscribe(destination, callback);
        this.stompSubscriptions.set(destination, subscription);
        console.log(`Subscribed to ${destination}`);
        return subscription;
      } catch (error) {
        console.error(`Error subscribing to ${destination}:`, error);
      }
    } else if (this.connecting) {
      // Queue the subscription to be processed when connection is established
      console.log(`Queuing subscription to ${destination} - client connecting`);
      this.subscriptionQueue.push({ destination, callback });
      return { id: `queued-${Date.now()}`, unsubscribe: () => {} };
    } else {
      console.warn(
        `Cannot subscribe to ${destination}: client not connected and not connecting`
      );
    }
    return null;
  }

  // Send message immediately if connected, otherwise queue it
  sendMessage(destination, body) {
    if (this.client && this.client.connected) {
      return this.sendMessageImmediate(destination, body);
    } else if (this.connecting) {
      // Queue the message to be sent when connection is established
      console.log(`Queuing message to ${destination} - client connecting`);
      this.messageQueue.push({ destination, body });
      return true;
    } else {
      console.warn(
        `Cannot send message to ${destination}: client not connected and not connecting`
      );
      return false;
    }
  }

  // Send message immediately without queueing
  sendMessageImmediate(destination, body) {
    if (this.client && this.client.connected) {
      try {
        this.client.publish({
          destination,
          body: JSON.stringify(body),
        });
        return true;
      } catch (error) {
        console.error(`Error sending message to ${destination}:`, error);
        return false;
      }
    } else {
      console.warn(
        `Cannot send message immediately to ${destination}: client not connected`
      );
      return false;
    }
  }

  // Chat message handlers
  onChatMessage(handler) {
    this.messageHandlers.chat.push(handler);
  }

  // Signaling handlers for WebRTC
  onSignalMessage(handler) {
    this.messageHandlers.signal.push(handler);
  }

  // Timer handlers
  onTimerUpdate(handler) {
    this.messageHandlers.timer.push(handler);
  }

  // Participant handlers
  onParticipantJoined(handler) {
    this.messageHandlers.participantJoined.push(handler);
  }

  onParticipantLeft(handler) {
    this.messageHandlers.participantLeft.push(handler);
  }

  // Status handlers
  onStatusUpdate(handler) {
    this.messageHandlers.status.push(handler);
  }

  // Notes handlers
  onNotesUpdate(handler) {
    this.messageHandlers.notes.push(handler);
  }

  // Code update handlers
  onCodeUpdate(handler) {
    this.messageHandlers.codeUpdate.push(handler);
  }

  offCodeUpdate(handler) {
    this.messageHandlers.codeUpdate = this.messageHandlers.codeUpdate.filter(
      (h) => h !== handler
    );
  }

  // Message sending methods
  sendChatMessage(interviewId, content) {
    return this.sendMessage(`/app/interview/${interviewId}/chat`, {
      content,
      timestamp: new Date().toISOString(),
    });
  }

  // WebRTC signaling methods
  sendSignalMessage(interviewId, signalData) {
    console.log("Sending signal message:", signalData);

    // Add sender ID to avoid processing own messages
    const enhancedSignalData = {
      ...signalData,
      sender: this.userId,
      timestamp: new Date().getTime(),
    };

    return this.sendMessage(
      `/app/interview/${interviewId}/signal`,
      enhancedSignalData
    );
  }

  sendTimerUpdate(interviewId, action) {
    return this.sendMessage(`/app/interview/${interviewId}/timer`, {
      action,
      timestamp: new Date().toISOString(),
    });
  }

  joinRoom(interviewId) {
    return this.sendMessage(`/app/interview/${interviewId}/join`, {
      timestamp: new Date().toISOString(),
    });
  }

  leaveRoom(interviewId) {
    return this.sendMessage(`/app/interview/${interviewId}/leave`, {
      timestamp: new Date().toISOString(),
    });
  }

  updateStatus(interviewId, status) {
    return this.sendMessage(`/app/interview/${interviewId}/status`, {
      status,
      timestamp: new Date().toISOString(),
    });
  }

  sendNotesUpdate(interviewId, content) {
    return this.sendMessage(`/app/interview/${interviewId}/notes`, {
      content,
      timestamp: new Date().toISOString(),
    });
  }

  // Add method to send code updates
  sendCodeUpdate(interviewId, questionId, code, language, currentQuestionIndex) {
    return this.sendMessage(`/app/interview/${interviewId}/code-update`, {
      type: 'CODE_UPDATE',
      questionId,
      code,
      language,
      currentQuestionIndex,
      timestamp: new Date().toISOString()
    });
  }
}
