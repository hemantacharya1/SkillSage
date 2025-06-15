package com.skillsage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillsage.entity.InterviewSubmission;

@Repository
public interface InterviewSubmissionRepository extends JpaRepository<InterviewSubmission, Long> {
    Optional<InterviewSubmission> findByInterviewId(Long interviewId);
}
