package com.skillsage.service.impl;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.skillsage.dto.request.ChatMessage;
import com.skillsage.dto.request.TimerMessage;
import com.skillsage.dto.request.WebSocketMessage;
import com.skillsage.service.IWebSocketService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebSocketServiceImpl implements IWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void handleJoin(String interviewId, String userId) {
        WebSocketMessage message = new WebSocketMessage();
        message.setType("JOIN");
        message.setSenderId(userId);
        message.setInterviewId(interviewId);
        message.setTimestamp(System.currentTimeMillis());
        
        broadcastMessage(interviewId, message);
    }

    @Override
    public void handleLeave(String interviewId, String userId) {
        WebSocketMessage message = new WebSocketMessage();
        message.setType("LEAVE");
        message.setSenderId(userId);
        message.setInterviewId(interviewId);
        message.setTimestamp(System.currentTimeMillis());
        
        broadcastMessage(interviewId, message);
    }

    @Override
    public void handleChatMessage(ChatMessage message) {
        message.setTimestamp(System.currentTimeMillis());
        broadcastMessage(message.getInterviewId(), message);
    }

    @Override
    public void handleTimerUpdate(TimerMessage message) {
        message.setTimestamp(System.currentTimeMillis());
        broadcastMessage(message.getInterviewId(), message);
    }

    @Override
    public void broadcastMessage(String interviewId, WebSocketMessage message) {
        messagingTemplate.convertAndSend("/topic/interview/" + interviewId, message);
    }

    @Override
    public void sendPrivateMessage(String userId, WebSocketMessage message) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/messages", message);
    }
} 