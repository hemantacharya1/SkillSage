package com.skillsage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillsage.entity.QuestionSubmission;

public interface QuestionSubmissionRepository extends JpaRepository<QuestionSubmission, Long> {

}
