package com.skillsage.entity;

import java.time.LocalDateTime;

import com.skillsage.entity.enums.SubmissionStatus;

import jakarta.persistence.Entity;
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
public class CodeSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String code;
    private String language;
    private String output;
    private SubmissionStatus status; // SUBMITTED, EXECUTING, COMPLETED, ERROR
    
    @ManyToOne
    private Question question;
    
    @ManyToOne
    private User candidate;
    
    // Timestamps
    private LocalDateTime submittedAt;
}