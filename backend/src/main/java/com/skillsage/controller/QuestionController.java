package com.skillsage.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsage.config.MessageResponse;
import com.skillsage.dto.response.InterviewResponse;
import com.skillsage.dto.response.QuestionResponse;
import com.skillsage.entity.Question;
import com.skillsage.repository.QuestionRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

	private final QuestionRepository questionRepo;

	@GetMapping
	public ResponseEntity<?> getQuestions() {
		List<Question> data = questionRepo.findAll();
		List<QuestionResponse> reslist = new ArrayList<>();
		for (Question q : data) {
			QuestionResponse res = new QuestionResponse();
			res.setDescription(q.getDescription());
			res.setId(q.getId());
			res.setLanguage(q.getLanguage());
			res.setTitle(q.getTitle());
			reslist.add(res);
		}
		return ResponseEntity.ok(new MessageResponse("", reslist));
	}

}
