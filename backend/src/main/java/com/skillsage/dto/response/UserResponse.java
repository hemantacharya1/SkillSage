package com.skillsage.dto.response;

import com.skillsage.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

	private Long userId;
	private String email;
	private String firstName;
	private String lastName;
	private String role;

	public static UserResponse toResponse(User user) {
		return UserResponse.builder().userId(user.getId()).email(user.getEmail()).firstName(user.getFirstName())
				.lastName(user.getLastName()).role(user.getRole().name()).build();
	}
}
