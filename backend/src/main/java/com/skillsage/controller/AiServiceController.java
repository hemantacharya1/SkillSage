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
import com.skillsage.dto.response.CodeSubmissionTimeSpaceComplexityResponse;
import com.skillsage.dto.response.HtmlAiResponse;
import com.skillsage.dto.response.PlagiarismResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiServiceController {
	
	@GetMapping("/detect-plagiarism/{id}")
    public ResponseEntity<?> getPlagerimsResponse(@PathVariable(value = "id")Long id) {
		List<PlagiarismResponse> res = new ArrayList<>();
		PlagiarismResponse obj = new PlagiarismResponse(86, true, "he has plagrised","Two Sum");
		res.add(obj);
		return ResponseEntity.ok(new MessageResponse("", res));
    }
	@GetMapping("/generate-summary/{id}")
    public ResponseEntity<?> generateSummary(@PathVariable(value = "id")Long id) {
		AIFeedbackSummary res = new AIFeedbackSummary("good code","5 star");
    	return ResponseEntity.ok(new MessageResponse("",res));
    }
	@GetMapping("/generate-time-space-complexity/{id}")
    public ResponseEntity<?> generateTimeSpaceComplexity(@PathVariable(value = "id")Long id) {
    	CodeSubmissionTimeSpaceComplexityResponse res = new CodeSubmissionTimeSpaceComplexityResponse();
    	res.setQuestionName("Two sum");
    	res.setSpaceComplexity("O(1)");
    	res.setTimeComplexity("O(n)");
    	List<CodeSubmissionTimeSpaceComplexityResponse> list = new ArrayList<>();
    	list.add(res);
        return ResponseEntity.ok(new MessageResponse("", list));
    }
	@GetMapping("/code-quaility-chek/{id}")
    public ResponseEntity<?> getInterviews(@PathVariable(value = "id")Long id) {
        return ResponseEntity.ok(new MessageResponse("", new HtmlAiResponse("<h1>Hello</h1>")));
    }

}
