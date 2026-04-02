package com.campushub.backend.services.authentication;

import com.campushub.backend.models.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class EmailVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);

    @Autowired(required = false)
    JavaMailSender mailSender;

    @Value("${app.verification.base-url:http://localhost:9090/auth/verify-email}")
    String verificationBaseUrl;

    @Value("${app.mail.from:no-reply@campushub.local}")
    String fromEmail;

    public void sendVerificationEmail(User user, String rawVerificationToken) {
        String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);
        String encodedToken = URLEncoder.encode(rawVerificationToken, StandardCharsets.UTF_8);
        String verificationLink = verificationBaseUrl + "?email=" + encodedEmail + "&token=" + encodedToken;

        if (mailSender == null) {
            logger.info("Mail sender not configured. Verification link for {}: {}", user.getEmail(), verificationLink);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Your CampusHub verification code");
            message.setText("Your CampusHub verification code is: " + rawVerificationToken + "\n\n"
                    + "Enter this code in the app to verify your account. "
                    + "This code expires in 1 hour.\n\n"
                    + "You can also verify using this link: " + verificationLink);
            mailSender.send(message);
        } catch (Exception ex) {
            logger.warn("Failed to send verification email to {}. Verification link: {}", user.getEmail(), verificationLink, ex);
        }
    }
}
