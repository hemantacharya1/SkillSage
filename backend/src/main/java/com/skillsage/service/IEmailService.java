package com.skillsage.service;

import com.skillsage.entity.Interview;

public interface IEmailService {
    void sendInterviewInvitation(Interview interview);
} 