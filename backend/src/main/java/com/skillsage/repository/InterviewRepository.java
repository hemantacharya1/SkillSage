package com.skillsage.repository;

import com.skillsage.entity.Interview;
import com.skillsage.entity.enums.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByRecruiterId(Long recruiterId);
    List<Interview> findByCandidateId(Long candidateId);
    List<Interview> findByStartTimeAfterAndStatus(LocalDateTime now, InterviewStatus status);
    List<Interview> findByEndTimeBeforeAndStatus(LocalDateTime now, InterviewStatus status);
} 