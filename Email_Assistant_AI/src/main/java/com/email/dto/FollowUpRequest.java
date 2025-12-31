package com.email.dto;

import lombok.Data;

@Data
public class FollowUpRequest {
    private String emailContent;
    private int followUpNumber = 1;  // 1st, 2nd, final
    private int daysPassed = 0;
}