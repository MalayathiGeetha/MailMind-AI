package com.email.dto;

import lombok.Data;

@Data
public class ProviderRequest {
    private String provider;  // GEMINI, OLLAMA, LOCAL
}
