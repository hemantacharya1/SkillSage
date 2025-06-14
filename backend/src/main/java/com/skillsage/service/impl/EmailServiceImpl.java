package com.skillsage.service.impl;

import com.skillsage.entity.Interview;
import com.skillsage.service.IEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendInterviewInvitation(Interview interview) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(interview.getCandidate().getEmail());
        message.setSubject("Interview Invitation: " + interview.getTitle());
        message.setText(String.format(
            "Hello %s,\n\n" +
            "You have been invited to an interview:\n\n" +
            "Title: %s\n" +
            "Description: %s\n" +
            "Date: %s\n" +
            "Duration: %d minutes\n\n" +
            "Please join the interview at the scheduled time.\n\n" +
            "Best regards,\n" +
            "SkillSage Team",
            interview.getCandidate().getFirstName(),
            interview.getTitle(),
            interview.getDescription(),
            interview.getStartTime(),
            interview.getDuration()
        ));

        mailSender.send(message);
    }
} 