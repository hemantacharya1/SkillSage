package com.skillsage.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsage.config.GeminiService;
import com.skillsage.dto.response.AIFeedbackSummary;
import com.skillsage.dto.response.CodeQualityCheck;
import com.skillsage.dto.response.CodeSubmissionTimeSpaceComplexityResponse;
import com.skillsage.dto.response.PlagiarismResponse;
import com.skillsage.entity.CodeEmbedding;
import com.skillsage.entity.InterviewSubmission;
import com.skillsage.entity.QuestionSubmission;
import com.skillsage.entity.User;
import com.skillsage.repository.InterviewSubmissionRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiServiceImpl {

	private final CodeEmbeddingServiceImpl codeEmbeddingService;
	private final InterviewSubmissionRepository interviewSubmissionRepo;
	private final EntityManager entityManager;
	private final GeminiService geminiService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public List<PlagiarismResponse> detectPlagarism(Long interviewId) {

		InterviewSubmission submission = interviewSubmissionRepo.findByInterviewId(interviewId).orElse(null);
		if (submission == null) {
			return null;
		}
		List<PlagiarismResponse> response = new ArrayList<>();
		User candidate = submission.getCandidate();
		List<QuestionSubmission> questionSubmissions = submission.getQuestionSubmissions();
		for (QuestionSubmission qs : questionSubmissions) {
			float[] meanEmbedding = codeEmbeddingService.generateMeanEmbedding(qs.getCode());
			List<CodeEmbedding> similarEmbeddings = this.findSimilarEmbeddingsManually(qs.getQuestion().getId(),
					candidate.getId(), meanEmbedding, 5);

			if (similarEmbeddings.isEmpty()) {
				String message = this.plagarisimString(qs.getQuestion().getTitle(), "0", false, "none");
				PlagiarismResponse obj = new PlagiarismResponse(0, false, message, qs.getQuestion().getTitle());
				response.add(obj);
				continue;
			}
			double maxSimilarity = -1;

			for (CodeEmbedding embedding : similarEmbeddings) {
				double similarity = cosineSimilarity(meanEmbedding, embedding.getEmbedding());
				if (similarity > maxSimilarity) {
					maxSimilarity = similarity;
				}
			}

			double plagiarismPercent = Math.round(maxSimilarity * 10000.0) / 100.0; // Round to 2 decimals
			if (plagiarismPercent > 80) {
				String message = this.plagarisimString(qs.getQuestion().getTitle(), String.valueOf(plagiarismPercent),
						false, candidate.getEmail());
				PlagiarismResponse obj = new PlagiarismResponse(plagiarismPercent, true, message,
						qs.getQuestion().getTitle());
				response.add(obj);
			} else {
				String message = this.plagarisimString(qs.getQuestion().getTitle(), String.valueOf(plagiarismPercent),
						false, "none");
				PlagiarismResponse obj = new PlagiarismResponse(0, false, message, qs.getQuestion().getTitle());
				response.add(obj);
				continue;
			}

		}

		return response;
	}

	private double cosineSimilarity(float[] vec1, float[] vec2) {
		double dot = 0.0, norm1 = 0.0, norm2 = 0.0;
		for (int i = 0; i < vec1.length; i++) {
			dot += vec1[i] * vec2[i];
			norm1 += vec1[i] * vec1[i];
			norm2 += vec2[i] * vec2[i];
		}
		return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
	}

	public List<CodeEmbedding> findSimilarEmbeddingsManually(Long questionId, Long candidateId, float[] embedding,
			int limit) {
		String vectorLiteral = toPgVectorLiteral(embedding); // e.g. "[0.123456, 0.234567, ...]"

		String sql = """
				    SELECT id, question_id, candidate_id, embedding
				    FROM code_embeddings
				    WHERE question_id = :questionId
				    AND candidate_id != :candidateId
				    ORDER BY embedding <=> CAST(:vector AS vector)
				    LIMIT :limit
				""";

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("questionId", questionId);
		query.setParameter("candidateId", candidateId);
		query.setParameter("vector", vectorLiteral);
		query.setParameter("limit", limit);

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();

		List<CodeEmbedding> result = new ArrayList<>();

		for (Object[] row : rows) {
			CodeEmbedding ce = new CodeEmbedding();
			ce.setId(((Number) row[0]).longValue());
			ce.setQuestionId(((Number) row[1]).longValue());
			ce.setCandidateId(((Number) row[2]).longValue());

			// Parse the `vector` manually from the String (row[3])
			String vectorStr = row[3].toString().replaceAll("[\\[\\]]", "");
			String[] parts = vectorStr.split(",");
			float[] parsedVec = new float[parts.length];
			for (int i = 0; i < parts.length; i++) {
				parsedVec[i] = Float.parseFloat(parts[i].trim());
			}
			ce.setEmbedding(parsedVec);

			result.add(ce);
		}

		return result;
	}

	private String toPgVectorLiteral(float[] embedding) {
		StringBuilder sb = new StringBuilder("[");
		for (int i = 0; i < embedding.length; i++) {
			sb.append(String.format("%.6f", embedding[i]));
			if (i < embedding.length - 1)
				sb.append(", ");
		}
		sb.append("]");
		return sb.toString();
	}

	private String plagarisimString(String questionTitle, String similarity, boolean isPlagiarized,
			String candidateName) {

		String prompt = "";
		if (isPlagiarized) {
			prompt = String.format(
					"""
								You are a coding evaluator and must generate a short plagiarism feedback message in natural English using the provided data.
								This message is for the recruiter, so it should be **professional**, **clear**, and **helpful**.
								Always include:
								- The question title

								Data:
								Question Title: %s

								Example Response:
									The submission for "%s" shows a low similarity score, with a unique approach to solving the problem. The logic and structure appear to be written independently, suggesting that the code is original and not plagiarized. Please check at your end as well.

								Output:
								<your formatted response here>

							""",
					questionTitle, questionTitle);
		} else {
			prompt =

					String.format(
							"""
										You are a coding evaluator and must generate a short plagiarism feedback message in natural English using the provided data.
										This message is for the recruiter, so it should be **professional**, **clear**, and **helpful**.
										Always include:
										- The question title
										- The similarity percentage

										Data:
										Question Title: %s
										Similarity Percentage: %s
										Example Response:
											The submission for "%s" shows a HIGH similarity with existing known solutions. The structure and logic are nearly identical, with only minor changes in variable names and formatting. Based on this, it is likely that the code is plagiarized.Please check at your end as well

										Output:
										<your formatted response here>

									""",
							questionTitle, similarity, questionTitle);
		}
		String response = geminiService.generateResponse(prompt);
		return response;
	}

	public AIFeedbackSummary generateSummary(Long id) {
		InterviewSubmission submission = interviewSubmissionRepo.findByInterviewId(id).orElse(null);
		if (submission == null) {
			return null;
		}
		List<QuestionSubmission> questionSubmissions = submission.getQuestionSubmissions();
		String summaryResponse = this.generateSummaryPrompt(questionSubmissions);
		try {
			AIFeedbackSummary value = objectMapper.readValue(summaryResponse, AIFeedbackSummary.class);
			return value;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public String generateSummaryPrompt(List<QuestionSubmission> list) {
		StringBuilder promptBuilder = new StringBuilder();

		promptBuilder
				.append("You are a coding interview evaluator. A candidate has submitted multiple code solutions.\n");
		promptBuilder
				.append("You are given the question text, the candidate's code, and the programming language used.\n");
		promptBuilder.append(
				"Analyze the overall quality of their submissions and generate a recruiter-friendly summary.\n\n");
		promptBuilder.append("Here is the data for this candidate:\n\n");

		for (QuestionSubmission qs : list) {
			promptBuilder.append("---\n");
			promptBuilder.append("Question: ").append(qs.getQuestion().getTitle()).append("\n");

			promptBuilder.append("Question Detail: ").append(qs.getQuestion().getDescription()).append("\n");
			promptBuilder.append("Language: ").append(qs.getLanguage()).append("\n");
			promptBuilder.append("Candidate's Code:\n");
			promptBuilder.append("```\n").append(qs.getCode()).append("\n```\n");
			promptBuilder.append("---\n\n");
		}

		promptBuilder.append("Now provide:\n");
		promptBuilder.append(
				"1. A summary of the candidate’s overall performance, coding quality, and problem-solving approach.\n");
		promptBuilder.append("2. A star rating from 1 to 4 based on the following:\n");
		promptBuilder.append("   - ⭐ Poor / Unclear or unfinished code\n");
		promptBuilder.append("   - ⭐⭐ Basic / brute-force logic, but makes sense\n");
		promptBuilder.append("   - ⭐⭐⭐ Good approach, readable, and semi-optimal\n");
		promptBuilder.append("   - ⭐⭐⭐⭐ Excellent code, clean and optimal logic\n\n");
		promptBuilder.append("Must format your response in json output as:\n");
		promptBuilder.append("{\n");
		promptBuilder.append("  \"content\": \"Your summary here...\",\n");
		promptBuilder.append("  \"rating\": \"3/4 ⭐⭐⭐\"\n");
		promptBuilder.append("}");
		String prompt = promptBuilder.toString();
		String rawResponse = geminiService.generateResponse(prompt);
		return rawResponse.replaceAll("(?i)```json", "") // Remove ```json
				.replaceAll("(?i)```", "") // Remove any remaining ```
				.trim();
	}

	public List<CodeSubmissionTimeSpaceComplexityResponse> getComplexityAnalysis(Long id) {
		List<CodeSubmissionTimeSpaceComplexityResponse> response = new ArrayList<>();
		InterviewSubmission submission = interviewSubmissionRepo.findByInterviewId(id).orElse(null);
		if (submission == null) {
			return response;
		}
		List<QuestionSubmission> questionSubmissions = submission.getQuestionSubmissions();
		for (QuestionSubmission qs : questionSubmissions) {
			CodeSubmissionTimeSpaceComplexityResponse obj = this.generateComplexityAnalysisPrompt(
					qs.getQuestion().getTitle(), qs.getQuestion().getDescription(), qs.getLanguage(), qs.getCode());
			response.add(obj);
		}
		return response;

	}

	public CodeSubmissionTimeSpaceComplexityResponse generateComplexityAnalysisPrompt(String title, String description,
			String language, String code) {
		String prompt = String.format(
				"""
						  You are a software engineering evaluator.

						  A candidate attempted the following coding problem. Their solution is provided below. Please analyze the time and space complexity of the solution in Big-O notation, and briefly explain how you arrived at the answer.

						  Problem Title:
						%s

						  Problem Description:
						 %s

						  Language:
						  %s

						  Candidate's Code:
						  ```
						 %s
						  ```

						  Now provide:
						  1. Time Complexity (in Big-O notation) with a brief explanation
						  2. Space Complexity (in Big-O notation) with a brief explanation

						  Format the output in JSON like this:
						  {
						    "timeComplexity": "O(n log n)",
						    "spaceComplexity": "O(n)"
						  }
						  """,
				title, description, language, code);
		String response = geminiService.generateResponse(prompt).replaceAll("(?i)```json", "") // Remove ```json
				.replaceAll("(?i)```", "") // Remove any remaining ```
				.trim();
		ObjectMapper objectMapper = new ObjectMapper();
		Map<String, String> result = new HashMap<>();
		try {
			result = objectMapper.readValue(response, Map.class);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		String timeComplexity = result.get("timeComplexity");
		String spaceComplexity = result.get("spaceComplexity");
		CodeSubmissionTimeSpaceComplexityResponse res = new CodeSubmissionTimeSpaceComplexityResponse();
		res.setQuestionName(title);
		res.setSpaceComplexity(spaceComplexity);
		res.setTimeComplexity(timeComplexity);
		return res;
	}

	public List<CodeQualityCheck> generateCodeQualityCheckResponse(Long interviewId) {
		InterviewSubmission submission = interviewSubmissionRepo.findByInterviewId(interviewId).orElse(null);
		if (submission == null) {
			return null;
		}
		List<CodeQualityCheck> response = new ArrayList<>();
		List<QuestionSubmission> questionSubmissions = submission.getQuestionSubmissions();
		for (QuestionSubmission qs : questionSubmissions) {
			CodeQualityCheck obj = new CodeQualityCheck();
			String res = this.generateResponse(qs);
			obj.setContent(res);
			obj.setQuestionName(qs.getQuestion().getTitle());
			response.add(obj);
		}
		return response;
	}

	private String generateResponse(QuestionSubmission q) {
		String prompt = String.format(
				"""

						You are a senior coding evaluator. Your job is to analyze a candidate’s code submission for a specific programming question and provide clear, professional feedback intended for a recruiter.

						You will be given:
						- The coding **question**
						- The candidate’s **code submission**

						Based on this, generate a short paragraph (4–6 sentences) that highlights the overall **code quality**, including:
						- **Correctness** (does it solve the problem as intended?)
						- **Time and space complexity** (if obvious or relevant)
						- **Readability and structure** (naming, formatting, logic clarity)
						- **Edge case handling** (does it handle empty input, large input, etc.)
						- Any **noteworthy issues or improvements** (e.g., redundant logic, hardcoded values)

						This feedback should be understandable to non-technical recruiters but still insightful enough to support a hiring decision.

						---

						**Input:**
						-Question Title: %s
						- Question: %s
						- Submission Code:
							%s

						---

						**Output:**
						<your detailed but concise code analysis>
						""",
				q.getQuestion().getTitle(), q.getQuestion().getDescription(), q.getCode());
		String response = geminiService.generateResponse(prompt);
		return response;
	}
}
