package com.skillsage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillsage.config.EmailService;
import com.skillsage.config.MessageResponse;
import com.skillsage.dto.request.LoginRequest;
import com.skillsage.dto.request.SignupRequest;
import com.skillsage.dto.response.AuthResponse;
import com.skillsage.dto.response.UserResponse;
import com.skillsage.entity.User;
import com.skillsage.exception.BadRequestException;
import com.skillsage.repository.UserRepository;
import com.skillsage.service.IUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(value = "/api/auth")
@RequiredArgsConstructor
public class UserAuthController {

	
	private final IUserService userService;

	private final EmailService emailService;
	
	private final UserRepository userRepo;

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody SignupRequest request) {
		userService.registerUser(request);
		return ResponseEntity.ok(new MessageResponse("Signup Successfull"));
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
		AuthResponse response = userService.login(request);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/reset-password-sent-otp")
	public ResponseEntity<?> sentResetPasswordOtp(@RequestParam String email) {
		User user = userRepo.findByEmail(email).orElseThrow(() -> new BadRequestException("Email Not Found"));
		emailService.sendOtp(email, user.getFirstName(), "FORGOT_PASSWORD");
		return ResponseEntity.ok(new MessageResponse("Otp Sent Successfully"));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String newPassword,
			@RequestParam String otp) {
		userService.resetPassword(email, otp, newPassword);
		return ResponseEntity.ok(new MessageResponse("Password Changed Successfully"));
	}

	@GetMapping("/profile")
	public ResponseEntity<?> getUserProfile() {
		UserResponse profile = userService.profile();
		return ResponseEntity.ok(profile);
	}

}
