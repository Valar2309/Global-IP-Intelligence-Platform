package com.ipplatform.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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

    public void sendWelcomeEmail(String toEmail, String name) {
        send(toEmail,
             "Welcome to IP Intelligence Platform",
             "Hi " + name + ",\n\n" +
             "Your account has been created successfully.\n" +
             "Log in here: " + frontendUrl + "/login\n\n" +
             "— IP Intelligence Platform Team");
    }

    public void sendAnalystPendingEmail(String toEmail, String name) {
        send(toEmail,
             "Complete Your Analyst Registration — Upload Documents",
             "Hi " + name + ",\n\n" +
             "Your analyst account has been created. To complete your registration, " +
             "please upload your identity documents (Aadhaar Card, PAN Card, Passport, etc.) at:\n" +
             frontendUrl + "/submit-documents\n\n" +
             "Your account will be activated once an admin verifies your documents.\n\n" +
             "— IP Intelligence Platform Team");
    }

    public void sendAnalystApplicationSubmittedEmail(String toEmail, String name) {
        send(toEmail,
             "Documents Received — Under Admin Review",
             "Hi " + name + ",\n\n" +
             "We have received your identity documents. " +
             "Our admin team will review them and you will be notified by email once a " +
             "decision has been made.\n\n" +
             "— IP Intelligence Platform Team");
    }

    public void sendAnalystApprovedEmail(String toEmail, String name) {
        send(toEmail,
             "Analyst Account Approved — You Can Now Log In",
             "Hi " + name + ",\n\n" +
             "Your identity has been verified and your analyst account is now active.\n\n" +
             "Log in here: " + frontendUrl + "/login\n\n" +
             "— IP Intelligence Platform Team");
    }

    public void sendAnalystRejectedEmail(String toEmail, String name, String reason) {
        send(toEmail,
             "Update on Your Analyst Application",
             "Hi " + name + ",\n\n" +
             "We were unable to approve your analyst application.\n\n" +
             "Reason: " + reason + "\n\n" +
             "Please contact support if you have questions.\n\n" +
             "— IP Intelligence Platform Team");
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String link = frontendUrl + "/reset-password?token=" + resetToken;
        send(toEmail,
             "Reset Your Password",
             "Hi,\n\nClick the link to reset your password (valid 1 hour):\n" +
             link + "\n\nIgnore this if you didn't request it.\n\n" +
             "— IP Intelligence Platform Team");
    }

    private void send(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(mailFrom);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mailSender.send(msg);
    }
}