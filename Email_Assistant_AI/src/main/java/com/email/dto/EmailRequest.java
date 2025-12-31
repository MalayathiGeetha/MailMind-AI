package com.email.dto;

import lombok.Data;


@Data
public class EmailRequest {
    private String emailContent;
    private EmailTone tone;  // ← Changed from String to EmailTone enum
    private PromptVersion promptVersion;  // with getter/setter
    private AiProviderType provider;   // add getter/setter

}
