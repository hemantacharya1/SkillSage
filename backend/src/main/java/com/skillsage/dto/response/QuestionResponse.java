package com.skillsage.dto.response;

import lombok.Data;

@Data
public class QuestionResponse {
    private Long id;
    private String title;
    private String description;
    private String language; // JAVA, PYTHON, JAVASCRIPT
} 