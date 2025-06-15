package com.skillsage.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private String content;
    private Integer rating;
    private Long interviewId;
    private Long candidateId;
    private String candidateEmail;
    private LocalDateTime createdAt;
}
