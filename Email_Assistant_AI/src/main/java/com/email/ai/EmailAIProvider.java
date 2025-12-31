package com.email.ai;

public interface EmailAIProvider {
    String generateReply(String prompt);
    String getProviderName();
}

