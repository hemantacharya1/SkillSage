package com.skillsage.service;

import com.skillsage.dto.request.LoginRequest;
import com.skillsage.dto.request.SignupRequest;
import com.skillsage.dto.response.AuthResponse;
import com.skillsage.dto.response.UserResponse;

public interface IUserService {
	public void registerUser(SignupRequest request);

	public AuthResponse login(LoginRequest request);

	public UserResponse profile();

	public void resetPassword(String email, String otp, String newPassword);
}
