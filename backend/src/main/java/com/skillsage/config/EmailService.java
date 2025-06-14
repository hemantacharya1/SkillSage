package com.skillsage.config;

import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailService {

	
	private final JavaMailSender mailSender;

	
	private final RedisTemplate<String, String> redisTemplate;

	public void sendOtp(String email, String name, String type) {
		String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP
		redisTemplate.opsForValue().set("OTP_" + email, otp, 5, TimeUnit.MINUTES); // Store in Redis

		String subject = type.equalsIgnoreCase("FORGOT_PASSWORD") ? "Reset your password - Project Name"
				: "Your OTP for Project Name";
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true);
			helper.setTo(email);
			helper.setSubject(subject);
			helper.setText("Your OTP is: " + otp);
			mailSender.send(message);
		} catch (MessagingException e) {
			throw new RuntimeException("Failed to send email", e);
		}
	}

	public boolean validateOtp(String email, String otp) {
		String storedOtp = redisTemplate.opsForValue().get("OTP_" + email);
		return otp.equals(storedOtp);
	}

}
