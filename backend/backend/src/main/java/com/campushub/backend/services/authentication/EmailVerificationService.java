package com.campushub.backend.services.authentication;

import com.campushub.backend.models.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);

    @Autowired(required = false)
    JavaMailSender mailSender;

    @Value("${app.verification.base-url:http://localhost:9090/auth/verify-email}")
    String verificationBaseUrl;

    public void sendVerificationEmail(User user) {
        String verificationLink = verificationBaseUrl + "?email=" + user.getEmail() + "&token=" + user.getEmailVerificationToken();

        if (mailSender == null) {
            logger.info("Mail sender not configured. Verification link for {}: {}", user.getEmail(), verificationLink);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Verify your CampusHub account");
            message.setText("Thanks for registering at CampusHub. Click this link to verify your email: " + verificationLink);
            mailSender.send(message);
        } catch (Exception ex) {
            logger.warn("Failed to send verification email to {}. Verification link: {}", user.getEmail(), verificationLink, ex);
        }
    }
}
