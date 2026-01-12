package com.enterprise.todo.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your OTP for Todo Tracker");
        message.setText("Your OTP is: " + otp + ". It will expire in 5 minutes.");

        // Log to console as well for verification
        System.out.println("DEBUG: Sending OTP " + otp + " to " + to);

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // We don't throw exception here so the user can still see it in console if SMTP
            // is not configured
        }
    }
}
