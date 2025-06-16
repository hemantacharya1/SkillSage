package com.skillsage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionGenerateResponse {

	private String title;
	private String description;
	private String programmingLanguage;
}
