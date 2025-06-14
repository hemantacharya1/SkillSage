package com.skillsage.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateInterviewRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private Integer duration;
} 