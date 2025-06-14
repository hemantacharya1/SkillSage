package com.skillsage.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.skillsage.entity.enums.InterviewStatus;

import lombok.Data;

@Data
public class InterviewResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration;
    private InterviewStatus status;
    private UserResponse recruiter;
    private UserResponse candidate;
    private List<QuestionResponse> questions;
}