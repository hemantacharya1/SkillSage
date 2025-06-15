package com.skillsage.dto.request;

import lombok.Data;

@Data
public class WebSocketMessage {
    private String type; // CHAT, TIMER, STATUS, JOIN, LEAVE
    private String senderId;
    private String senderName;
    private String interviewId;
    private Long timestamp;
} 