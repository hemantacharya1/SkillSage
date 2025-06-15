package com.skillsage.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {

	private String title;
	private String description;
	private String language; 
}
