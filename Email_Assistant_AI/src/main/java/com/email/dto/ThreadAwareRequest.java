package com.email.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ThreadAwareRequest {
    private String emailContent;
    private List<String> previousEmails = new ArrayList<>();
    private EmailTone tone;
}

