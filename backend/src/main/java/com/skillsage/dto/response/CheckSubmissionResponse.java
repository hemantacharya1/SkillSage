package com.skillsage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckSubmissionResponse {

	private boolean willWork;
	private String issues;
}
