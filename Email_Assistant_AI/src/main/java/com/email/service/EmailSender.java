// src/main/java/com/email/service/EmailSender.java
package com.email.service;

import com.email.dto.SendEmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSender {

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendEmail(SendEmailRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            message.setFrom("noreply@yourapp.com");

            mailSender.send(message);
            System.out.println("✅ Email sent to: " + request.getTo());
            return true;

        } catch (Exception e) {
            System.out.println("❌ Email failed: " + e.getMessage());
            return false;
        }
    }
}
