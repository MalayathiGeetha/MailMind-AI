package com.email.dto;


import lombok.Data;

@Data
public class AdvancedEmailRequest {
    private String emailContent;
    private EmailTone tone;
    private RewriteMode mode = RewriteMode.GENERATE_REPLY; // Default
    private PromptVersion promptVersion;  // with getter/setter
    private AiProviderType provider;   // add getter/setter

}
