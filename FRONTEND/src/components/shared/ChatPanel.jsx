import { PlaneIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { CHAT_SERVER_URL } from "@/imports/baseUrl";

const ChatPanel = ({ interviewId, userRole, messages, setMessages }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup Socket.IO connection
  useEffect(() => {
    console.log("Connecting to chat server:", CHAT_SERVER_URL);

    // Connect to Socket.IO server
    socketRef.current = io(CHAT_SERVER_URL);

    // Handle connection
    socketRef.current.on("connect", () => {
      console.log("Connected to chat server");
      setIsConnected(true);

      // Join the interview room
      socketRef.current.emit("join-room", {
        interviewId,
        userRole,
      });
    });

    // Handle disconnection
    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from chat server");
      setIsConnected(false);
    });

    // Handle chat history
    socketRef.current.on("chat-history", (history) => {
      console.log("Received chat history:", history);
      setMessages(
        history.map((msg) => ({
          ...msg,
          isOwn: msg.sender === userRole,
        }))
      );
    });

    // Handle new chat messages
    socketRef.current.on("chat-message", (message) => {
      console.log("Received chat message:", message);
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          isOwn: message.sender === userRole,
        },
      ]);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [interviewId, userRole]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !isConnected) return;

    console.log("Sending message:", newMessage);

    // Send message via Socket.IO
    socketRef.current.emit("chat-message", {
      interviewId,
      content: newMessage.trim(),
      userRole,
    });

    // Clear input
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
        <p
          className={`text-sm ${
            isConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.isOwn
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.isOwn ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
