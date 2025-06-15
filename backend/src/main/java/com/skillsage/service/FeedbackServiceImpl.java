package com.skillsage.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.skillsage.dto.request.FeedbackRequest;
import com.skillsage.dto.response.FeedbackResponse;
import com.skillsage.entity.Feedback;
import com.skillsage.entity.Interview;
import com.skillsage.entity.User;
import com.skillsage.repository.FeedbackRepository;
import com.skillsage.repository.InterviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl {

	private final FeedbackRepository feedbackRepository;
    private final InterviewRepository interviewRepository;
    

    public FeedbackResponse createFeedback(FeedbackRequest request) {
        Interview interview = interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        User candidate = interview.getCandidate();

        Feedback feedback = new Feedback();
        feedback.setContent(request.getContent());
        feedback.setRating(request.getRating());
        feedback.setInterview(interview);
        feedback.setCandidate(candidate);
        feedback.setCreatedAt(LocalDateTime.now());

        Feedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }
    
    public FeedbackResponse getFeedback(Long interviewId) {
    	Feedback feedback = feedbackRepository.findByInterviewId(interviewId);
    	if(feedback==null) return null;
    	
    	FeedbackResponse response = this.mapToResponse(feedback);
    	return response;
    	
    }
    
    private FeedbackResponse mapToResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getContent(),
                feedback.getRating(),
                feedback.getInterview().getId(),
                feedback.getCandidate().getId(),
                feedback.getCandidate().getEmail(),
                feedback.getCreatedAt()
        );
    }
}
