package com.skillsage.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class InterviewSubmissionRequest {
    private Long interviewId;
    private List<SubmissionDetail> submissions;
    private List<ChatMessage> messages;
}
