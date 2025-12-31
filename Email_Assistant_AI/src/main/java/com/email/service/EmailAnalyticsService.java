package com.email.service;


import com.email.dto.EmailAnalyticsResponse;
import com.email.dto.EmailIntent;
import com.email.dto.EmailTone;
import com.email.repository.EmailHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailAnalyticsService {

    private final EmailHistoryRepository historyRepository;

    public EmailAnalyticsResponse getAnalyticsForUser(String username) {
        long total = historyRepository.countByUser_Username(username);

        Double avgLen = historyRepository.avgEmailLengthByUser(username);
        double averageLength = avgLen != null ? avgLen : 0.0;

        Map<EmailTone, Long> toneCounts = historyRepository.countByToneForUser(username).stream()
                .collect(Collectors.toMap(
                        row -> (EmailTone) row[0],
                        row -> (Long) row[1]
                ));

        Map<EmailIntent, Long> intentCounts = historyRepository.countByIntentForUser(username).stream()
                .collect(Collectors.toMap(
                        row -> (EmailIntent) row[0],
                        row -> (Long) row[1]
                ));

        return new EmailAnalyticsResponse(
                total,
                toneCounts,
                averageLength,
                intentCounts
                // avgConfidence != null ? avgConfidence : 0.0
        );
    }
}

