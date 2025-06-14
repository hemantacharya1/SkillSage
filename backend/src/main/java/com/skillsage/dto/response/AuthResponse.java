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
public class AuthResponse {

	private String accessToken;
	private UserResponse userResponse;

	public static AuthResponse toResponse(String token, User user) {
		AuthResponse res = new AuthResponse();
		res.setAccessToken(token);
		UserResponse response = UserResponse.toResponse(user);
		res.setUserResponse(response);
		return res;
	}
}
