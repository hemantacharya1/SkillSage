package com.skillsage.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "code_embeddings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "embedding", columnDefinition = "vector(768)")
    private float[] embedding;

    @Column(name = "submitted_at", updatable = false, insertable = false)
    private Timestamp submittedAt;

    // Getters & Setters
}
