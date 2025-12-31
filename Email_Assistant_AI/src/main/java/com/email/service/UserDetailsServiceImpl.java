// src/main/java/com/email/service/UserDetailsServiceImpl.java
package com.email.service;

import com.email.dto.UserDashboard;
import com.email.entity.EmailHistory;
import com.email.entity.User;
import com.email.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final EmailHistoryService historyService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .roles("USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    // ✅ ADD THIS DASHBOARD METHOD (REAL DATA!)
    // In your UserDetailsServiceImpl.java - REPLACE dashboard method
    public UserDashboard getUserDashboard(String username) {
        UserDashboard dashboard = new UserDashboard();
        dashboard.setUsername(username);

        // ✅ SAFE: Count emails by username
        dashboard.setTotalEmails(historyService.countByUserUsername(username));

        List<EmailHistory> recent = historyService.getRecentEmailsByUsername(username, 5);
        dashboard.setRecentEmails(recent.stream()
                .map(history -> {
                    String content = history.getEmailContent();
                    // ✅ SAFE SUBSTRING - handles short strings!
                    return content != null && content.length() > 60
                            ? content.substring(0, 60) + "..."
                            : (content != null ? content : "No content");
                })
                .collect(Collectors.toList())
        );

        dashboard.setPreferredProvider("GEMINI");

        // ✅ SAFE STATS
        if (!recent.isEmpty()) {
            double avgLength = recent.stream()
                    .mapToInt(h -> h.getEmailContent() != null ? h.getEmailContent().length() : 0)
                    .average().orElse(0);
            dashboard.setAvgEmailLength(Math.round(avgLength));
        }

        dashboard.setTopTones(recent.stream()
                .map(h -> h.getTone() != null ? h.getTone().name() : "UNKNOWN")
                .filter(tone -> tone != null && !tone.isEmpty())
                .distinct()
                .limit(3)
                .collect(Collectors.toList())
        );

        dashboard.setTotalWordsGenerated(
                recent.stream()
                        .mapToInt(h -> h.getGeneratedResponse() != null ? h.getGeneratedResponse().length() : 0)
                        .sum()
        );

        return dashboard;
    }

    // ADD THIS METHOD to your UserDetailsServiceImpl
    public void setPreferredAiProvider(String username, String provider) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setPreferredAiProvider(provider.toUpperCase());
        userRepository.save(user);
        System.out.println("✅ Provider switched to: " + provider + " for user: " + username);
    }



}
