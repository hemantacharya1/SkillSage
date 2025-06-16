package com.skillsage.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsage.config.MessageResponse;
import com.skillsage.dto.request.CreateQuestionRequest;
import com.skillsage.dto.request.QuestionGenerate;
import com.skillsage.dto.response.QuestionGenerateResponse;
import com.skillsage.dto.response.QuestionResponse;
import com.skillsage.entity.Question;
import com.skillsage.exception.BadRequestException;
import com.skillsage.repository.QuestionRepository;
import com.skillsage.service.AiServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

	private final QuestionRepository questionRepo;
	private final AiServiceImpl aiServiceImpl;

	@PostMapping
	public ResponseEntity<?> addQuestion(@RequestBody CreateQuestionRequest request) {
		Question q = new Question();
		q.setDescription(request.getDescription());
		q.setLanguage(request.getLanguage());
		q.setTitle(request.getTitle());

		Question save = questionRepo.save(q);
		QuestionResponse res = this.toResponse(save);
		return ResponseEntity.ok(new MessageResponse("Question Created Successfully", res));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> putMethodName(@PathVariable(value = "id") Long id, @RequestBody CreateQuestionRequest r) {
		Question question = questionRepo.findById(id)
				.orElseThrow(() -> new BadRequestException("No Question found with id"));
		question.setDescription(r.getDescription());
		question.setLanguage(r.getLanguage());
		question.setTitle(r.getTitle());
		Question save = questionRepo.save(question);
		QuestionResponse res = this.toResponse(save);
		return ResponseEntity.ok(new MessageResponse("Question updated Successfully", res));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delteQuestion(@PathVariable(value = "id") Long id) {
		Question question = questionRepo.findById(id)
				.orElseThrow(() -> new BadRequestException("No Question found with id"));
		questionRepo.delete(question);
		return ResponseEntity.ok(new MessageResponse("Question Deleted Successfully", null));
	}

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

	@PostMapping("/generate")
	public ResponseEntity<?> generateWithAi(@RequestBody QuestionGenerate request) {
		QuestionGenerateResponse obj = aiServiceImpl.generateQuestionResponse(request.getPrompt());
		return ResponseEntity.ok(obj);
	}

	private QuestionResponse toResponse(Question q) {
		QuestionResponse res = new QuestionResponse();
		res.setDescription(q.getDescription());
		res.setId(q.getId());
		res.setLanguage(q.getLanguage());
		res.setTitle(q.getTitle());
		return res;
	}

}
