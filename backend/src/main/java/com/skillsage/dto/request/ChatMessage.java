package com.skillsage.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ChatMessage extends WebSocketMessage {
    private String content;
    private String sender;
} 