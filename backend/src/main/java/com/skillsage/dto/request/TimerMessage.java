package com.skillsage.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TimerMessage extends WebSocketMessage {
    private Long remainingTime; // in seconds
    private String status; // STARTED, PAUSED, COMPLETED
} 