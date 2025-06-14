package com.skillsage.controller;

import com.skillsage.config.MessageResponse;
import com.skillsage.dto.request.CreateInterviewRequest;
import com.skillsage.dto.request.UpdateInterviewRequest;
import com.skillsage.dto.response.InterviewResponse;
import com.skillsage.service.IInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final IInterviewService interviewService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> createInterview(@RequestBody CreateInterviewRequest request) {
    	InterviewResponse response = interviewService.createInterview(request);
        return ResponseEntity.ok(new MessageResponse("", response));
    }

    @GetMapping
    public ResponseEntity<?> getInterviews() {
    	List<InterviewResponse> response = interviewService.getInterviews();
        return ResponseEntity.ok(new MessageResponse("", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterviewById(@PathVariable Long id) {
    	InterviewResponse response = interviewService.getInterviewById(id);
        return ResponseEntity.ok(new MessageResponse("", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> updateInterview(
            @PathVariable Long id,
            @RequestBody UpdateInterviewRequest request) {
    	InterviewResponse response = interviewService.updateInterview(id, request);
        return ResponseEntity.ok(new MessageResponse("", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok().build();
    }
} 