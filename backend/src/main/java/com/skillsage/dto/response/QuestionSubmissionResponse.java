package com.skillsage.dto.response;

import java.time.LocalDateTime;

import com.skillsage.entity.enums.SubmissionStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionSubmissionResponse {
    private Long questionId;
    private String questionTitle;
    private String code;
    private String language;
    private SubmissionStatus status;
    private LocalDateTime submittedAt;
}
