package com.skillsage.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

	@NotNull(message = "Please provide name")
	private String firstName;
	private String lastName;
	private String mobileNumber;
	@NotNull
	private String email;
	@NotNull
	private String password;
	@NotNull
	private String role;
}
