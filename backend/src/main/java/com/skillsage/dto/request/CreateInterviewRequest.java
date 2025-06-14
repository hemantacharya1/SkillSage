package com.skillsage.dto.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateInterviewRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private Integer duration;
    private String candidateEmail;
    private List<Long> questionIds;
}

@Data
class QuestionRequest {
    private String title;
    private String description;
    private String language; // JAVA, PYTHON, JAVASCRIPT
} 