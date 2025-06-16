package com.skillsage.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsage.config.MessageResponse;
import com.skillsage.dto.response.AIFeedbackSummary;
import com.skillsage.dto.response.CodeQualityCheck;
import com.skillsage.dto.response.CodeSubmissionTimeSpaceComplexityResponse;
import com.skillsage.dto.response.HtmlAiResponse;
import com.skillsage.dto.response.PlagiarismResponse;
import com.skillsage.service.AiServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiServiceController {

	private final AiServiceImpl service;

	@GetMapping("/detect-plagiarism/{id}")
	public ResponseEntity<?> getPlagerimsResponse(@PathVariable(value = "id") Long id) {
		List<PlagiarismResponse> res = service.detectPlagarism(id);
		return ResponseEntity.ok(new MessageResponse("", res));
	}

	@GetMapping("/generate-summary/{id}")
	public ResponseEntity<?> generateSummary(@PathVariable(value = "id") Long id) {
		AIFeedbackSummary res = service.generateSummary(id);
		return ResponseEntity.ok(new MessageResponse("", res));
	}

	@GetMapping("/generate-time-space-complexity/{id}")
	public ResponseEntity<?> generateTimeSpaceComplexity(@PathVariable(value = "id") Long id) {
		List<CodeSubmissionTimeSpaceComplexityResponse> list = service.getComplexityAnalysis(id);
		return ResponseEntity.ok(new MessageResponse("", list));
	}

	@GetMapping("/code-quaility-chek/{id}")
	public ResponseEntity<?> getInterviews(@PathVariable(value = "id") Long id) {
		List<CodeQualityCheck> list = service.generateCodeQualityCheckResponse(id);
		return ResponseEntity.ok(new MessageResponse("", list));
		
	}

}
