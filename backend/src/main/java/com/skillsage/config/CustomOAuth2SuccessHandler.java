package com.skillsage.config;

import java.io.IOException;
import java.net.URLEncoder;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsage.entity.User;
import com.skillsage.entity.enums.Role;
import com.skillsage.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

	private final UserRepository userRepository;
	private final JwtUtil jwtUtil;
	private final ObjectMapper objectMapper;
	private final PasswordEncoder encoder;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {

		OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
		String email = oauthUser.getAttribute("email");
		String name = oauthUser.getAttribute("name");

		User user = userRepository.findByEmail(email).orElseGet(() -> {
			User newUser = new User();
			newUser.setEmail(email);
			newUser.setFirstName(name);
			newUser.setPassword(encoder.encode("Demo@123"));
			newUser.setRole(Role.CANDIDATE);
			return userRepository.save(newUser);
		});

		String token = jwtUtil.generateToken(user.getEmail());
		
		String redirectUrl = "http://localhost:5173/oauth2/redirect"
			    + "?token=" + URLEncoder.encode(token, "UTF-8")
			    + "&user=" + URLEncoder.encode(objectMapper.writeValueAsString(user), "UTF-8");
			response.sendRedirect(redirectUrl);
	}
}
