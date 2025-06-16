package com.skillsage.entity;

import java.time.LocalDateTime;

import com.skillsage.entity.enums.SubmissionStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSubmission {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	private InterviewSubmission interviewSubmission;

	@ManyToOne
	private Question question;
	
	private String code;
	private String language;

	@Enumerated(EnumType.STRING)
	private SubmissionStatus status; // SUBMITTED, EXECUTING, COMPLETED, ERROR

	private LocalDateTime submittedAt;
}
