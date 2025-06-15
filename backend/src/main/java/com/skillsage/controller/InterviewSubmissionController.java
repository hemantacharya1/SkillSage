package com.skillsage.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsage.config.MessageResponse;
import com.skillsage.dto.request.InterviewSubmissionRequest;
import com.skillsage.dto.response.InterviewSubmissionResponse;
import com.skillsage.entity.InterviewSubmission;
import com.skillsage.service.InterviewSubmissionService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submissions")
public class InterviewSubmissionController {

    private final InterviewSubmissionService submissionService;

    @PostMapping
    public ResponseEntity<?> postMethodName(@RequestBody InterviewSubmissionRequest request) {
       
    	InterviewSubmission submission = submissionService.createSubmission(request);
        return ResponseEntity.ok(new MessageResponse("Submission Saved Successfully", null));
    }
    
    
    @GetMapping("/{id}")
    ResponseEntity<?> getSubmission(@PathVariable(value ="id")Long id) {
        InterviewSubmissionResponse response = submissionService.getSubmissionByRecruiter(id);
		return ResponseEntity.ok(new MessageResponse("", response));
    }
}
