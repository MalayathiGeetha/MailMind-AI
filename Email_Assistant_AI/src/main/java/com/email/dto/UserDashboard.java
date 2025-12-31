// src/main/java/com/email/dto/UserDashboard.java
package com.email.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDashboard {
    private String username;
    private long totalEmails;
    private long totalWordsGenerated;
    private List<String> topTones;
    private List<String> recentEmails;
    private double avgEmailLength;
    private String preferredProvider;
}
