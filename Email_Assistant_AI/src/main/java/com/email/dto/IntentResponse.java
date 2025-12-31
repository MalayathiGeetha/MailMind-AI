package com.email.dto;


import lombok.Data;

@Data
public class IntentResponse {
    private EmailIntent intent;
    private String reason;

    // ✅ Add this constructor
    public IntentResponse(EmailIntent intent, String reason) {
        this.intent = intent;
        this.reason = reason;
    }

    // ✅ Default constructor (Jackson needs this)
    public IntentResponse() {}
}

