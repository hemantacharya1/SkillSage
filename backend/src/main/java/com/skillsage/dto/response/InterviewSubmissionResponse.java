package com.skillsage.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewSubmissionResponse {
    private Long submissionId;
    private Long interviewId;
    private Long candidateId;
    private String candidateEmail;
    private LocalDateTime submittedAt;
    private List<QuestionSubmissionResponse> questionSubmissions;
}

