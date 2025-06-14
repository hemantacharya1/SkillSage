package com.skillsage.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillsage.dto.request.CreateInterviewRequest;
import com.skillsage.dto.request.UpdateInterviewRequest;
import com.skillsage.dto.response.InterviewResponse;
import com.skillsage.dto.response.QuestionResponse;
import com.skillsage.dto.response.UserResponse;
import com.skillsage.entity.Interview;
import com.skillsage.entity.Question;
import com.skillsage.entity.User;
import com.skillsage.entity.enums.InterviewStatus;
import com.skillsage.exception.BadRequestException;
import com.skillsage.exception.InterviewNotFoundException;
import com.skillsage.repository.InterviewRepository;
import com.skillsage.repository.QuestionRepository;
import com.skillsage.repository.UserRepository;
import com.skillsage.service.IEmailService;
import com.skillsage.service.IInterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements IInterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final IEmailService emailService;

    @Override
    @Transactional
    public InterviewResponse createInterview(CreateInterviewRequest request) {
        String recruiterEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new BadRequestException("Recruiter not found"));
        
        User candidate = userRepository.findByEmail(request.getCandidateEmail())
                .orElseThrow(() -> new BadRequestException("Candidate not found"));

        // Fetch questions from database
        List<Question> questions = questionRepository.findByIdIn(request.getQuestionIds());
        if (questions.size() != request.getQuestionIds().size()) {
            throw new BadRequestException("One or more questions not found");
        }

        Interview interview = new Interview();
        interview.setTitle(request.getTitle());
        interview.setDescription(request.getDescription());
        interview.setStartTime(request.getStartTime());
        interview.setDuration(request.getDuration());
        interview.setEndTime(request.getStartTime().plusMinutes(request.getDuration()));
        interview.setStatus(InterviewStatus.SCHEDULED);
        interview.setRecruiter(recruiter);
        interview.setCandidate(candidate);
        interview.setQuestions(questions);

        Interview savedInterview = interviewRepository.save(interview);
        emailService.sendInterviewInvitation(savedInterview);

        return mapToResponse(savedInterview);
    }

    @Override
    public List<InterviewResponse> getInterviews() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BadRequestException("User not found"));

        List<Interview> interviews;
        if (user.getRole().name().equalsIgnoreCase("RECRUITER")) {
            interviews = interviewRepository.findByRecruiterId(user.getId());
        } else {
            interviews = interviewRepository.findByCandidateId(user.getId());
        }

        return interviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InterviewResponse getInterviewById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new InterviewNotFoundException("Interview not found"));
        return mapToResponse(interview);
    }

    @Override
    @Transactional
    public InterviewResponse updateInterview(Long id, UpdateInterviewRequest request) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new InterviewNotFoundException("Interview not found"));

        interview.setTitle(request.getTitle());
        interview.setDescription(request.getDescription());
        interview.setStartTime(request.getStartTime());
        interview.setDuration(request.getDuration());
        interview.setEndTime(request.getStartTime().plusMinutes(request.getDuration()));

        Interview updatedInterview = interviewRepository.save(interview);
        return mapToResponse(updatedInterview);
    }

    @Override
    @Transactional
    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new InterviewNotFoundException("Interview not found");
        }
        interviewRepository.deleteById(id);
    }

    private InterviewResponse mapToResponse(Interview interview) {
        InterviewResponse response = new InterviewResponse();
        response.setId(interview.getId());
        response.setTitle(interview.getTitle());
        response.setDescription(interview.getDescription());
        response.setStartTime(interview.getStartTime());
        response.setEndTime(interview.getEndTime());
        response.setDuration(interview.getDuration());
        response.setStatus(interview.getStatus());
        response.setRecruiter(mapUserToResponse(interview.getRecruiter()));
        response.setCandidate(mapUserToResponse(interview.getCandidate()));
        
        // Map questions
        response.setQuestions(interview.getQuestions().stream()
            .map(this::mapQuestionToResponse)
            .collect(Collectors.toList()));
            
        return response;
    }

    private UserResponse mapUserToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole().name());
        return response;
    }

    private QuestionResponse mapQuestionToResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setTitle(question.getTitle());
        response.setDescription(question.getDescription());
        response.setLanguage(question.getLanguage());
        return response;
    }
} 