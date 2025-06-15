package com.skillsage.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillsage.config.ContextService;
import com.skillsage.dto.request.InterviewSubmissionRequest;
import com.skillsage.dto.request.SubmissionDetail;
import com.skillsage.dto.response.InterviewSubmissionResponse;
import com.skillsage.dto.response.QuestionSubmissionResponse;
import com.skillsage.entity.CodeEmbedding;
import com.skillsage.entity.Interview;
import com.skillsage.entity.InterviewSubmission;
import com.skillsage.entity.Question;
import com.skillsage.entity.QuestionSubmission;
import com.skillsage.entity.enums.InterviewStatus;
import com.skillsage.entity.enums.SubmissionStatus;
import com.skillsage.repository.CodeEmbeddingRepository;
import com.skillsage.repository.InterviewRepository;
import com.skillsage.repository.InterviewSubmissionRepository;
import com.skillsage.repository.QuestionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewSubmissionService {

	private final InterviewRepository interviewRepository;
	private final QuestionRepository questionRepository;
	private final InterviewSubmissionRepository interviewSubmissionRepository;
	private final ContextService contextService;
	private final CodeEmbeddingServiceImpl codeEmbeddingService;
	private final CodeEmbeddingRepository codeEmbeddingRepository;

	@Transactional
	public InterviewSubmission createSubmission(InterviewSubmissionRequest request) {
		// Find the Interview based on the Interview ID
		Interview interview = interviewRepository.findById(request.getInterviewId())
				.orElseThrow(() -> new RuntimeException("Interview not found"));

		// Prepare the InterviewSubmission
		InterviewSubmission submission = new InterviewSubmission();
		submission.setInterview(interview);
		submission.setCandidate(interview.getCandidate());
		submission.setSubmittedAt(LocalDateTime.now());

		// Prepare and add QuestionSubmissions
		List<QuestionSubmission> questionSubmissions = new ArrayList<>();

		for (SubmissionDetail detail : request.getSubmissions()) {
			Question question = questionRepository.findById(detail.getQuestionId())
					.orElseThrow(() -> new RuntimeException("Question not found with ID: " + detail.getQuestionId()));

			QuestionSubmission questionSubmission = new QuestionSubmission();
			questionSubmission.setQuestion(question);
			questionSubmission.setCode(detail.getCode());
			questionSubmission.setLanguage(detail.getLanguage());
			questionSubmission.setStatus(SubmissionStatus.SUBMITTED);
			questionSubmission.setSubmittedAt(LocalDateTime.now());
			questionSubmission.setInterviewSubmission(submission); // Link back to parent

			questionSubmissions.add(questionSubmission);
		}

		submission.setQuestionSubmissions(questionSubmissions);

		// Save the submission along with all associated QuestionSubmissions
		InterviewSubmission save = interviewSubmissionRepository.save(submission);
		interview.setStatus(InterviewStatus.COMPLETED);
		interviewRepository.save(interview);
		Long candidateId = interview.getCandidate().getId();

		// create embading and store in database
		for (SubmissionDetail sd : request.getSubmissions()) {
			float[] embedding = codeEmbeddingService.generateMeanEmbedding(sd.getCode());
			CodeEmbedding entity = new CodeEmbedding();
			entity.setEmbedding(embedding);
			entity.setQuestionId(sd.getQuestionId());
			entity.setCandidateId(candidateId);

			// Step 3: Save
			codeEmbeddingRepository.save(entity);
		}
		return save;
	}

	public InterviewSubmissionResponse getSubmissionByRecruiter(Long id) {
		Interview interview = interviewRepository.findById(id).get();
		
		InterviewSubmission submission = interviewSubmissionRepository.findByInterviewId(interview.getId()).orElse(null);
		if (submission == null) {
				return null;
		} else {
				List<QuestionSubmissionResponse> questionResponses = submission.getQuestionSubmissions().stream()
						.map(qs -> new QuestionSubmissionResponse(qs.getQuestion().getId(), qs.getQuestion().getTitle(),
								qs.getCode(), qs.getLanguage(), qs.getStatus(), qs.getSubmittedAt()))
						.collect(Collectors.toList());
				InterviewSubmissionResponse interviewSubmissionResponse = new InterviewSubmissionResponse(
						submission.getId(), submission.getInterview().getId(), submission.getCandidate().getId(),
						submission.getCandidate().getEmail(), submission.getSubmittedAt(), questionResponses);
		

		return interviewSubmissionResponse;
		}
	}
}