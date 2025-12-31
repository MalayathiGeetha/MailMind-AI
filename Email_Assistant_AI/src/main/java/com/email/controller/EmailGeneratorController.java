package com.email.controller;

import com.email.dto.*;
import com.email.entity.EmailHistory;
import com.email.service.EmailAnalyticsService;
import com.email.service.EmailGeneratorService;
import com.email.service.EmailHistoryService;
import com.email.service.EmailSender;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;
    private final EmailHistoryService historyService;
    private final EmailAnalyticsService analyticsService;
    private final EmailSender emailSender;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody Object rawRequest, Authentication auth) {
        ObjectMapper mapper = new ObjectMapper();
        try {

            AdvancedEmailRequest advRequest = mapper.convertValue(rawRequest, AdvancedEmailRequest.class);
            return ResponseEntity.ok(emailGeneratorService.processMode(advRequest, auth));  // ✅ Pass auth
        } catch (IllegalArgumentException e) {
            EmailRequest legacyRequest = mapper.convertValue(rawRequest, EmailRequest.class);
            return ResponseEntity.ok(emailGeneratorService.generateEmailReply(legacyRequest, auth));  // ✅ Pass auth
        }
    }

    @PostMapping("/thread-reply")
    public ResponseEntity<String> threadAwareReply(@RequestBody ThreadAwareRequest request, Authentication auth) {
        return ResponseEntity.ok(emailGeneratorService.generateThreadAwareReply(request, auth));  // ✅ Pass auth
    }

    @PostMapping("/follow-up")
    public ResponseEntity<String> generateFollowUp(@RequestBody FollowUpRequest request, Authentication auth) {
        return ResponseEntity.ok(emailGeneratorService.generateFollowUp(request, auth));  // ✅ Pass auth
    }


    @PostMapping("/detect-intent")
    public ResponseEntity<IntentResponse> detectIntent(@RequestBody Map<String, String> request) {
        String emailContent = request.get("emailContent");
        IntentResponse intent = emailGeneratorService.detectIntent(emailContent);
        return ResponseEntity.ok(intent);
    }

    @PostMapping("/subject")
    public ResponseEntity<List<String>> generateSubject(@RequestBody SubjectRequest request) {
        List<String> subjects = emailGeneratorService.generateSubjectLines(request.getEmailContent());
        return ResponseEntity.ok(subjects);
    }



    @PostMapping("/summarize")
    public ResponseEntity<SummaryResponse> summarizeEmail(@RequestBody Map<String, String> request) {
        SummaryResponse summary = emailGeneratorService.summarizeEmail(request.get("emailContent"));
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/history")
    public ResponseEntity<List<EmailHistory>> getHistory(Authentication auth) {
        System.out.println("➡ /history Authentication = " + auth);
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).body(List.of());
        }

        String username = auth.getName();
        System.out.println("🔍 Getting history for user: " + username);
        List<EmailHistory> history = historyService.getUserHistory(username);
        return ResponseEntity.ok(history);
    }



    @GetMapping("/history/intent/{intent}")
    public ResponseEntity<List<EmailHistory>> getHistoryByIntent(@PathVariable String intent) {
        try {
            // ✅ Case-insensitive + valid enum check
            EmailIntent emailIntent = EmailIntent.valueOf(intent.toUpperCase());
            return ResponseEntity.ok(historyService.getByIntent(emailIntent));
        } catch (IllegalArgumentException e) {
            // ✅ Return empty list instead of 400
            System.out.println("❌ Invalid intent: " + intent + ". Available: " +
                    java.util.Arrays.toString(EmailIntent.values()));
            return ResponseEntity.ok(List.of());  // ✅ Empty list, not 400
        }
    }


    @PostMapping("/send-email")
    public ResponseEntity<String> sendEmail(@RequestBody SendEmailRequest request) {
        System.out.println("📧 Sending email to: " + request.getTo());

        try {
            boolean sent = emailSender.sendEmail(request);
            if (sent) {
                System.out.println("✅ Email sent successfully!");
                return ResponseEntity.ok("✅ Email sent to " + request.getTo());
            } else {
                return ResponseEntity.status(500).body("❌ Failed to send email");
            }
        } catch (Exception e) {
            System.out.println("❌ Email error: " + e.getMessage());
            return ResponseEntity.status(500).body("❌ Error: " + e.getMessage());
        }
    }







    @PostMapping("/score-quality")
    public ResponseEntity<QualityResponse> scoreQuality(@RequestBody Map<String, String> request) {
        String emailContent = request.get("emailContent");
        System.out.println("➡ /score-quality emailContent = " + emailContent);
        QualityResponse quality = emailGeneratorService.scoreEmailQuality(emailContent);
        return ResponseEntity.ok(quality);
    }

    @PostMapping("/detect-risk")
    public ResponseEntity<RiskResponse> detectRisk(@RequestBody Map<String, String> request) {
        String emailContent = request.get("emailContent");
        System.out.println("➡ /detect-risk emailContent = " + emailContent);
        RiskResponse risk = emailGeneratorService.detectRisk(emailContent);
        return ResponseEntity.ok(risk);
    }


    @GetMapping("/analytics")
    public ResponseEntity<EmailAnalyticsResponse> getAnalytics(Authentication auth) {
        String username = auth.getName();
        EmailAnalyticsResponse analytics = analyticsService.getAnalyticsForUser(username);
        return ResponseEntity.ok(analytics);
    }
}
