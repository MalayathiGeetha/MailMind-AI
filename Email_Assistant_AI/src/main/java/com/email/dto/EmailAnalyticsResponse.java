package com.email.dto;

import java.util.Map;

public record EmailAnalyticsResponse(
        long totalEmails,
        Map<EmailTone, Long> toneCounts,
        double averageEmailLength,
        Map<EmailIntent, Long> intentCounts
        // Double averageConfidence   // add when you store confidence
) {}


