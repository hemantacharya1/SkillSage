package com.skillsage.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsage.dto.request.FeedbackRequest;
import com.skillsage.dto.response.FeedbackResponse;
import com.skillsage.service.FeedbackServiceImpl;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/feedbacks")
public class FeedbackController {

	private final FeedbackServiceImpl feedbackService;
	
	@PostMapping
    public ResponseEntity<FeedbackResponse> create(@RequestBody FeedbackRequest request) {
        return new ResponseEntity<>(feedbackService.createFeedback(request), HttpStatus.CREATED);
    }
	
	@GetMapping("/{id}")
	public String getFeedback(@RequestParam String param) {
		return new String();
	}
	
}
