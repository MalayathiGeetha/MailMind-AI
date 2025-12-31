// src/main/java/com/email/dto/SendEmailRequest.java
package com.email.dto;

public class SendEmailRequest {
    private String to;
    private String subject;
    private String body;

    // Getters & Setters
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
