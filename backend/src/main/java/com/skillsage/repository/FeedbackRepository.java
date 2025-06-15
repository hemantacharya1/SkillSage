package com.skillsage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillsage.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
	Feedback findByInterviewId(Long id);
}

