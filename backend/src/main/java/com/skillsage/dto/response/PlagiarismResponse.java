package com.skillsage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlagiarismResponse {
    private double plagiarismChance;
    private boolean plagraised;
    private String content;
    private String questionName;
}