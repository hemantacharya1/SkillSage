package com.skillsage.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skillsage.config.ContextService;
import com.skillsage.config.EmailService;
import com.skillsage.config.JwtUtil;
import com.skillsage.dto.request.LoginRequest;
import com.skillsage.dto.request.SignupRequest;
import com.skillsage.dto.response.AuthResponse;
import com.skillsage.dto.response.UserResponse;
import com.skillsage.entity.User;
import com.skillsage.entity.enums.Role;
import com.skillsage.exception.BadRequestException;
import com.skillsage.repository.UserRepository;
import com.skillsage.service.IUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IUserServiceImpl implements IUserService {

	private final PasswordEncoder encoder;

	private final UserRepository userRepo;

	private final ContextService contextService;

	private final EmailService emailService;

	private final JwtUtil jwtUtil;

	@Override
	public void registerUser(SignupRequest request) {
		User obj = userRepo.findByEmail(request.getEmail()).orElse(null);
		if (obj != null) {
			throw new BadRequestException("Email already exists");
		}
		User user = new User();
		user.setEmail(request.getEmail());
		user.setFirstName(request.getFirstName());
		user.setLastName(request.getLastName());
		user.setMobileNumber(request.getMobileNumber());
		user.setRole(Role.valueOf(request.getRole()));
		user.setPassword(encoder.encode(request.getPassword()));
		userRepo.save(user);
	}

	@Override
	public AuthResponse login(LoginRequest request) {
		User user = userRepo.findByEmail(request.getEmail())
				.orElseThrow(() -> new BadRequestException("Invalid credentials"));

		if (!encoder.matches(request.getPassword(), user.getPassword())) {
			throw new BadRequestException("Invalid credentials");
		}

		String token = jwtUtil.generateToken(user.getEmail());
		return AuthResponse.toResponse(token, user);
	}

	@Override
	public UserResponse profile() {
		User user = contextService.getCurrentUser();
		if (user == null) {
			throw new BadRequestException("Invalid User");
		}
		return UserResponse.toResponse(user);
	}

	@Override
	public void resetPassword(String email, String otp, String newPassword) {
		User user = userRepo.findByEmail(email).orElseThrow(() -> new BadRequestException("Wrong email"));
		boolean validate = emailService.validateOtp(email, otp);
		if (!validate) {
			throw new BadRequestException("Invalid or Wrong Otp");
		}
		user.setPassword(encoder.encode(newPassword));
		userRepo.save(user);
	}

}
