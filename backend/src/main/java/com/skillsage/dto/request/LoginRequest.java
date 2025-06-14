package com.skillsage.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
	
	@NotNull(message = "email can't be empty")
	private String email;
	@NotNull(message = "password can't be empty")
	private String password;
}
