package com.skillsage.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.skillsage.entity.CodeEmbedding;

@Repository
public interface CodeEmbeddingRepository extends JpaRepository<CodeEmbedding, Long> {

    @Query(value = """
        SELECT * FROM code_embeddings
        WHERE question_id = :questionId
        AND candidate_id != :candidateId
        ORDER BY embedding <=> CAST(:vector AS vector)
        LIMIT :limit
    """, nativeQuery = true)
    List<CodeEmbedding> findSimilarEmbeddings(
    	    @Param("questionId") Long questionId,
    	    @Param("candidateId") Long candidateId,
    	    @Param("vector") String embeddingVector,
    	    @Param("limit") int limit
    	);
    
 }

