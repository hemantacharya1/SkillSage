package com.skillsage.service;

import com.skillsage.dto.request.ChatMessage;
import com.skillsage.dto.request.TimerMessage;
import com.skillsage.dto.request.WebSocketMessage;

public interface IWebSocketService {
    void handleJoin(String interviewId, String userId);
    void handleLeave(String interviewId, String userId);
    void handleChatMessage(ChatMessage message);
    void handleTimerUpdate(TimerMessage message);
    void broadcastMessage(String interviewId, WebSocketMessage message);
    void sendPrivateMessage(String userId, WebSocketMessage message);
} 