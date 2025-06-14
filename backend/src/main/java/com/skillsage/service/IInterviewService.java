package com.skillsage.service;

import com.skillsage.dto.request.CreateInterviewRequest;
import com.skillsage.dto.request.UpdateInterviewRequest;
import com.skillsage.dto.response.InterviewResponse;

import java.util.List;

public interface IInterviewService {
    InterviewResponse createInterview(CreateInterviewRequest request);
    List<InterviewResponse> getInterviews();
    InterviewResponse getInterviewById(Long id);
    InterviewResponse updateInterview(Long id, UpdateInterviewRequest request);
    void deleteInterview(Long id);
} 