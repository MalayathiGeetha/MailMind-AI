package com.email.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EmailAIProviderRegistry {

    private final List<EmailAIProvider> providers;

    @Value("${email.ai.provider:GEMINI}")   // default provider name
    private String defaultProviderName;

    private Map<String, EmailAIProvider> providerMap() {
        return providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toUpperCase(),
                        p -> p
                ));
    }

    public EmailAIProvider getDefaultProvider() {
        return providerMap().getOrDefault(defaultProviderName.toUpperCase(),
                providerMap().get("GEMINI"));
    }

    public EmailAIProvider getProvider(String name) {
        if (name == null) return getDefaultProvider();
        return providerMap().getOrDefault(name.toUpperCase(), getDefaultProvider());
    }
}
