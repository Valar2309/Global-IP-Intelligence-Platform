package com.ipplatform.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails.
 *
 * Required application.yml / .env config:
 *
 *   spring.mail.host=smtp.gmail.com
 *   spring.mail.port=587
 *   spring.mail.username=${MAIL_USERNAME}
 *   spring.mail.password=${MAIL_PASSWORD}        ← Gmail App Password (not your login password)
 *   spring.mail.properties.mail.smtp.auth=true
 *   spring.mail.properties.mail.smtp.starttls.enable=true
 *
 *   app.frontend-url=http://localhost:3000        ← used to build reset links
 *   app.mail-from=noreply@ipplatform.com
 *
 * pom.xml dependency:
 *   <dependency>
 *     <groupId>org.springframework.boot</groupId>
 *     <artifactId>spring-boot-starter-mail</artifactId>
 *   </dependency>
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mail-from:noreply@ipplatform.com}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ── Password Reset ────────────────────────────────────────────────────────

    /**
     * Sends a password reset link.
     * The link points to your FRONTEND, which then calls POST /auth/reset-password.
     *
     * Link format: {frontendUrl}/reset-password?token={token}
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(toEmail);
        message.setSubject("Reset your IP Platform password");
        message.setText(
                "Hi,\n\n" +
                "You requested a password reset for your IP Intelligence Platform account.\n\n" +
                "Click the link below to reset your password (valid for 1 hour):\n" +
                resetLink + "\n\n" +
                "If you didn't request this, you can safely ignore this email.\n\n" +
                "— IP Intelligence Platform Team"
        );

        mailSender.send(message);
    }

    // ── Welcome Email ─────────────────────────────────────────────────────────

    /**
     * Sent after successful registration.
     */
    public void sendWelcomeEmail(String toEmail, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(toEmail);
        message.setSubject("Welcome to IP Intelligence Platform");
        message.setText(
                "Hi " + name + ",\n\n" +
                "Welcome to IP Intelligence Platform! Your account has been created successfully.\n\n" +
                "You can now log in and start exploring global IP data.\n\n" +
                frontendUrl + "/login\n\n" +
                "— IP Intelligence Platform Team"
        );

        mailSender.send(message);
    }
}