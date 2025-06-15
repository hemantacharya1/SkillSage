package com.skillsage.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.skillsage.entity.enums.InterviewStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration; // in minutes
    private InterviewStatus status; // SCHEDULED, IN_PROGRESS, COMPLETED, EXPIRED
    
    @ManyToOne
    private User recruiter;
    
    @ManyToOne
    private User candidate;
    
    @ManyToMany
    @OrderBy("id ASC")
    private List<Question> questions;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}