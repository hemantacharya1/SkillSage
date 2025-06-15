package com.skillsage.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

import com.skillsage.dto.request.ChatMessage;
import com.skillsage.dto.request.TimerMessage;
import com.skillsage.dto.request.WebSocketMessage;
import com.skillsage.service.IWebSocketService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final IWebSocketService webSocketService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/interview/{interviewId}/join")
    public void handleJoin(@Payload WebSocketMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();
        webSocketService.handleJoin(message.getInterviewId(), userId);
    }

    @MessageMapping("/interview/{interviewId}/leave")
    public void handleLeave(@Payload WebSocketMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();
        webSocketService.handleLeave(message.getInterviewId(), userId);
    }

    @MessageMapping("/interview/{interviewId}/chat")
    public void handleChat(@Payload ChatMessage message) {
        webSocketService.handleChatMessage(message);
    }

    @MessageMapping("/interview/{interviewId}/timer")
    public void handleTimer(@Payload TimerMessage message) {
        webSocketService.handleTimerUpdate(message);
    }
    // --- WebRTC signaling relay ---
    @MessageMapping("/interview/{interviewId}/signal")
    public void handleSignal(@DestinationVariable String interviewId, @Payload Object signalData) {
        // Relay signaling message to all participants in the interview room
        messagingTemplate.convertAndSend("/topic/interview/" + interviewId + "/signal", signalData);
    }
} 