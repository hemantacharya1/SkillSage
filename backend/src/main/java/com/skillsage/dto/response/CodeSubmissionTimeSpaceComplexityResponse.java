package com.skillsage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmissionTimeSpaceComplexityResponse {
	private String questionName;
	private String timeComplexity;
	private String spaceComplexity;
}
