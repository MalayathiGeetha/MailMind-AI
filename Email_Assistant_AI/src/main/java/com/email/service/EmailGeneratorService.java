package com.email.service;                      // ✅ DTO EmailTone

import com.email.ai.EmailAIProvider;
import com.email.ai.EmailAIProviderRegistry;
import com.email.dto.*;
import com.email.entity.EmailHistory;
import com.email.entity.User;
import com.email.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailGeneratorService {

    private final WebClient.Builder webClientBuilder;
    private final EmailHistoryService historyService;
    private final UserRepository userRepository;  // ✅ NEW: Load user from DB
    private final EmailAIProviderRegistry providerRegistry;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;
    private WebClient webClient;  // ✅ Lazy init

    @PostConstruct
    public void init() {
        this.webClient = webClientBuilder
                .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofSeconds(20))))
                .build();
        debugEnv();
    }

    @PostConstruct
    public void debugEnv() {
        System.out.println("URL = " + geminiApiUrl);
        System.out.println("KEY is null? " + (geminiApiKey == null));
        if (geminiApiKey != null) {
            System.out.println("KEY length = " + geminiApiKey.length());
        }
    }

    // in EmailGeneratorService
    public String geminiGenerateText(String prompt) {
        String response = callGeminiApi(prompt);
        return extractResponseContent(response);
    }

    private String callGeminiApi(String prompt) {
        int maxRetries = 3;
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // ✅ Add 1s delay between requests
                Thread.sleep(1000 * attempt);

                Map<String, Object> requestBody = Map.of(
                        "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                        "generationConfig", Map.of(
                                "temperature", 0.7,  // ✅ Slightly lower for consistency
                                "topK", 40,
                                "topP", 0.95,
                                "maxOutputTokens", 800  // ✅ Reduced
                        )
                );

                String response = webClient.post()
                        .uri(geminiApiUrl + "?key=" + geminiApiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                                Mono.error(new RuntimeException("Gemini API Error: " + clientResponse.statusCode())))
                        .bodyToMono(String.class)
                        .block(Duration.ofSeconds(15));  // ✅ Reduced timeout

                return response;

            } catch (Exception e) {
                if (e.getMessage().contains("429") || e.getMessage().contains("Too Many Requests")) {
                    System.out.println("⏳ Rate limited. Retry " + (attempt + 1) + "/" + maxRetries);
                    if (attempt == maxRetries - 1) {
                        return "Rate limited by Gemini. Try again in 1-2 minutes. (Free tier: 15 RPM)";
                    }
                    continue;
                }
                throw new RuntimeException("Gemini API failed: " + e.getMessage(), e);
            }
        }
        return "Max retries exceeded";
    }


    public String generateEmailReply(EmailRequest emailRequest, Authentication auth) {
        EmailIntent intent = detectIntent(emailRequest.getEmailContent()).getIntent();

        PromptVersion version = emailRequest.getPromptVersion() != null
                ? emailRequest.getPromptVersion()
                : PromptVersion.V2_STRUCTURED;

        String prompt = buildPromptForVersion(
                emailRequest.getEmailContent(),
                emailRequest.getTone(),
                version
        );
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        String preferredProvider = user.getPreferredAiProvider();

        EmailAIProvider provider = providerRegistry.getProvider(
                preferredProvider  // ✅ Uses user's choice!
        );

//        EmailAIProvider provider = providerRegistry.getProvider(
//                emailRequest.getProvider() != null ? emailRequest.getProvider().name() : null
//        );

        String finalResponse = provider.generateReply(prompt);

        saveToHistory(emailRequest.getEmailContent(), finalResponse,
                emailRequest.getTone(), intent, auth);


        return finalResponse;
    }


    public String processMode(AdvancedEmailRequest request, Authentication auth) {
        String prompt = buildModeSpecificPrompt(request);

        EmailAIProvider provider = providerRegistry.getProvider(
                request.getProvider() != null ? request.getProvider().name() : null
        );

        String finalResponse = provider.generateReply(prompt);

        EmailIntent intent = detectIntent(request.getEmailContent()).getIntent();
        saveToHistory(request.getEmailContent(), finalResponse, request.getTone(), intent, auth);
        return finalResponse;
    }

    private String buildModeSpecificPrompt(AdvancedEmailRequest request) {
        String emailContent = request.getEmailContent();
        RewriteMode mode = request.getMode();
        EmailTone toneEnum = request.getTone();
        String tone = toneEnum != null ? toneEnum.name().toLowerCase() : "professional";
        PromptVersion version = request.getPromptVersion() != null
                ? request.getPromptVersion()
                : PromptVersion.V2_STRUCTURED;

        // Only GENERATE_REPLY uses versioned prompts; others keep specialized instructions
        String basePrompt = switch (mode) {
            case GENERATE_REPLY -> buildPromptForVersion(emailContent, toneEnum, version);

            case POLISH -> "Polish this email: fix grammar, improve clarity, keep meaning same.\n\n" + emailContent;

            case SHORTEN -> "Shorten this email: keep all key points, remove redundancy.\n\n" + emailContent;

            case EXPAND -> "Expand this email: add polite details and clarification while keeping original intent.\n\n" + emailContent;

            case MAKE_FORMAL -> "Rewrite this email as a completely formal business email.\n\n" + emailContent;

            default -> throw new IllegalArgumentException("Unknown mode: " + mode);
        };

        return basePrompt + "\n\nTone: " + tone;
    }


    // ✅ NEW: Thread-aware with Authentication
    public String generateThreadAwareReply(ThreadAwareRequest request, Authentication auth) {
        String prompt = buildThreadAwarePrompt(request);
        String response = callGeminiApi(prompt);
        String finalResponse = extractResponseContent(response);

        EmailIntent intent = detectIntent(request.getEmailContent()).getIntent();
        saveToHistory(request.getEmailContent(), finalResponse, request.getTone(), intent, auth);
        return finalResponse;
    }

    // ✅ FIXED: Accepts Authentication + intent typo fix
    public String generateFollowUp(FollowUpRequest request, Authentication auth) {
        String followUpType = switch (request.getFollowUpNumber()) {
            case 1 -> "first";
            case 2 -> "second";
            default -> "final";
        };
        String urgency = switch (request.getFollowUpNumber()) {
            case 3 -> "urgent final reminder";
            case 2 -> "polite reminder";
            default -> "gentle follow-up";
        };

        String prompt = """
                Generate a professional %s follow-up email (%s follow-up after %d days no response).
                Reference the original email content. Be increasingly urgent.
                Do not include subject line.
                
                Original email: %s
                """.formatted(followUpType, urgency, request.getDaysPassed(), request.getEmailContent());

        String response = callGeminiApi(prompt);
        String finalResponse = extractResponseContent(response);

        EmailIntent intent = detectIntent(request.getEmailContent()).getIntent();
        saveToHistory(request.getEmailContent(), finalResponse, EmailTone.FOLLOW_UP, intent, auth);  // ✅ Fixed: inten → intent
        return finalResponse;
    }

    // ✅ CRITICAL: FIXED user loading + history saving
    private void saveToHistory(String emailContent, String response, EmailTone tone, EmailIntent intent, Authentication auth) {
        if (auth == null || auth.getName() == null) {
            System.out.println("⚠️ No auth - skipping history save");
            return;
        }

        try {
            User currentUser = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found: " + auth.getName()));

            EmailHistory history = new EmailHistory();
            history.setEmailContent(emailContent);
            history.setGeneratedResponse(response);
            history.setTone(tone != null ? tone : EmailTone.FORMAL);
            history.setIntent(intent != null ? intent : EmailIntent.OTHER);
            history.setUser(currentUser);

            historyService.save(history);
            System.out.println("✅ History saved for user: " + currentUser.getUsername());
        } catch (Exception e) {
            System.out.println("❌ History save failed: " + e.getMessage());
        }
    }

    // ✅ All your existing methods stay the same (unchanged)
    /*private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            if (root.has("error")) {
                return "Gemini API Error: " + root.path("error").path("message").asText();
            }

            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return "No response generated by Gemini.";
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return "Gemini returned empty content.";
            }

            return parts.get(0).path("text").asText();
        } catch (Exception e) {
            return "Error processing Gemini response: " + e.getMessage();
        }
    }*/


    private String extractResponseContent(String response) {
        // ✅ FIRST: Check if it's our error message (plain text)
        if (response.contains("Rate limited") || response.contains("Max retries") ||
                response.startsWith("Gemini API Error") || response.startsWith("Error processing")) {
            return response;  // ✅ Return plain text error directly
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            // ✅ Handle Gemini error response
            if (root.has("error")) {
                return "Gemini API Error: " + root.path("error").path("message").asText();
            }

            // ✅ Handle normal Gemini response
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return "No response generated by Gemini.";
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return "Gemini returned empty content.";
            }

            return parts.get(0).path("text").asText();

        } catch (Exception e) {
            System.out.println("Raw Gemini response (parse failed): " + response.substring(0, 200));
            return "Error processing Gemini response: " + e.getMessage() + ". Raw: " + response.substring(0, 100);
        }
    }


    public IntentResponse detectIntent(String emailContent) {
        // ✅ STEP 1: Try LOCAL keyword detection FIRST (instant, no rate limits)
        IntentResponse localResult = detectIntentLocal(emailContent);
        if (localResult != null && !localResult.getIntent().equals(EmailIntent.OTHER)) {
            System.out.println("✅ LOCAL Intent: " + localResult.getIntent() + " - " + localResult.getReason());
            return localResult;
        }

        // ✅ STEP 2: Try Gemini (with rate limit protection)
        try {
            String prompt = """
                Classify this email into EXACTLY ONE intent from: COMPLAINT, JOB_APPLICATION, INTERVIEW_REPLY, FOLLOW_UP, SALES_INQUIRY, SUPPORT_REQUEST, GREETING, OTHER.
                
                Respond with ONLY this JSON format. NO OTHER TEXT:
                {"intent": "INTENT_NAME", "reason": "brief explanation"}
                
                Email: %s
                """.formatted(emailContent);

            String response = callGeminiApi(prompt);
            if (response.contains("Rate limited") || response.contains("429")) {
                System.out.println("⚠️ Gemini rate limited → Using local fallback");
                return detectIntentLocal(emailContent);
            }

            String intentText = extractResponseContent(response);
            String cleanJson = cleanJsonResponse(intentText);

            ObjectMapper mapper = new ObjectMapper();
            IntentResponse geminiResult = mapper.readValue(cleanJson, IntentResponse.class);

            if (geminiResult.getIntent() != null && !geminiResult.getIntent().equals(EmailIntent.OTHER)) {
                System.out.println("✅ GEMINI Intent: " + geminiResult.getIntent());
                return geminiResult;
            }

            // Gemini said OTHER → try local
            return detectIntentLocal(emailContent);

        } catch (Exception e) {
            System.out.println("❌ Gemini failed → Local fallback: " + e.getMessage());
            return detectIntentLocal(emailContent);
        }
    }

    // ✅ NEW: INSTANT keyword-based detection (NO API CALLS)
    private IntentResponse detectIntentLocal(String emailContent) {
        if (emailContent == null) return new IntentResponse(EmailIntent.OTHER, "Empty email");

        String lower = emailContent.toLowerCase();

        // ✅ HIGH PRIORITY: FOLLOW_UP (most common)
        if (lower.contains("follow up") || lower.contains("circling back") ||
                lower.contains("checking in") || lower.contains("haven't heard") ||
                lower.contains("just following up") || lower.contains("reminder")) {
            return new IntentResponse(EmailIntent.FOLLOW_UP, "Follow-up keywords detected");
        }

        // ✅ JOB_APPLICATION
        if (lower.contains("job") || lower.contains("position") || lower.contains("apply") ||
                lower.contains("resume") || lower.contains("application") || lower.contains("hiring")) {
            return new IntentResponse(EmailIntent.JOB_APPLICATION, "Job application keywords");
        }

        // ✅ INTERVIEW_REPLY
        if (lower.contains("interview") || lower.contains("meeting") || lower.contains("schedule") ||
                lower.contains("call") || lower.contains("zoom") || lower.contains("time")) {
            return new IntentResponse(EmailIntent.INTERVIEW_REPLY, "Interview/meeting scheduling");
        }

        // ✅ SUPPORT_REQUEST
        if (lower.contains("help") || lower.contains("issue") || lower.contains("problem") ||
                lower.contains("not working") || lower.contains("error") || lower.contains("bug") ||
                lower.contains("urgent") || lower.contains("asap")) {
            return new IntentResponse(EmailIntent.SUPPORT_REQUEST, "Support/technical issue");
        }

        // ✅ SALES_INQUIRY
        if (lower.contains("price") || lower.contains("cost") || lower.contains("quote") ||
                lower.contains("demo") || lower.contains("interested") || lower.contains("pricing")) {
            return new IntentResponse(EmailIntent.SALES_INQUIRY, "Sales/pricing inquiry");
        }

        // ✅ COMPLAINT
        if (lower.contains("complaint") || lower.contains("refund") || lower.contains("charge") ||
                lower.contains("wrong") || lower.contains("broken") || lower.contains("dissatisfied")) {
            return new IntentResponse(EmailIntent.COMPLAINT, "Complaint/billing issue");
        }

        // ✅ GREETING
        if (lower.contains("hello") || lower.contains("hi") || lower.contains("thank") ||
                lower.contains("nice to meet") || lower.contains("welcome")) {
            return new IntentResponse(EmailIntent.GREETING, "Greeting/thanks message");
        }

        // ✅ DEFAULT: OTHER
        return new IntentResponse(EmailIntent.OTHER, "General communication - no specific intent detected");
    }


    private String cleanJsonResponse(String text) {
        if (text == null) return "{}";
        return text
                .replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();
    }


    private String buildPrompt(EmailRequest emailRequest) {
        return """
                Generate ONE professional email reply for this email. Be direct and concise. 
                Do not include subject line, options, or explanations. Just the email body.
                
                Tone: %s
                
                Original email:
                %s
                """.formatted(
                emailRequest.getTone() != null ? emailRequest.getTone().name().toLowerCase() : "professional",
                emailRequest.getEmailContent()
        );
    }



    private String buildThreadAwarePrompt(ThreadAwareRequest request) {
        StringBuilder prompt = new StringBuilder("Thread context:\n");
        for (int i = 0; i < request.getPreviousEmails().size(); i++) {
            prompt.append((i + 1)).append(". ").append(request.getPreviousEmails().get(i)).append("\n");
        }
        prompt.append("\nReply to latest: ").append(request.getEmailContent())
                .append("\n\nGenerate professional reply considering full context. No subject.");
        if (request.getTone() != null) {
            prompt.append(" Tone: ").append(request.getTone().name().toLowerCase());
        }
        return prompt.toString();
    }


    // ✅ YOUR EXISTING FEATURES 4-6 STAY THE SAME (generateSubjectLines, generateFollowUp, summarizeEmail)
    public List<String> generateSubjectLines(String emailContent) {
        String prompt = """
        Generate EXACTLY 3 professional, concise subject lines for this email content.
        Return ONLY JSON array: ["Subject 1", "Subject 2", "Subject 3"]
        NO other text, NO explanations.
        
        Email: %s
        """.formatted(emailContent);

        String response = callGeminiApi(prompt);
        String subjectsText = extractResponseContent(response);
        String cleanJson = cleanJsonResponse(subjectsText);

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleanJson, mapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of("Re: Your Email", "Follow-up", "Regarding Your Message");
        }
    }


    public SummaryResponse summarizeEmail(String emailContent) {
        String prompt = """
        Analyze this email and return ONLY valid JSON with:
        {
          "summary": "1-2 sentence summary",
          "actionItems": ["item1", "item2"],
          "deadlines": ["MM/DD", "ASAP", null]
        }
        Use null for empty arrays. Be precise.
        
        Email: %s
        """.formatted(emailContent);

        String response = callGeminiApi(prompt);
        String summaryText = extractResponseContent(response);
        String cleanJson = cleanJsonResponse(summaryText);

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleanJson, SummaryResponse.class);
        } catch (Exception e) {
            return new SummaryResponse(
                    "Could not summarize email",
                    List.of("Review email manually"),
                    List.of()
            );
        }
    }




    public QualityResponse scoreEmailQuality(String emailContent) {
        String prompt = """
        Analyze this email for quality and return ONLY valid JSON:
        {
          "sentiment": "positive",
          "politenessScore": 8.5,
          "professionalismScore": 9.2
        }
        Scores 0-10. Be precise and honest.

        Email: %s
        """.formatted(emailContent);

        String response = callGeminiApi(prompt);
        System.out.println("RAW quality response = " + response);
        String cleanText = extractResponseContent(response);
        System.out.println("EXTRACTED quality = " + cleanText);

        // If Gemini responded with an error message, don’t try to parse
        if (cleanText.startsWith("Gemini API Error") || cleanText.startsWith("Rate limited")) {
            return new QualityResponse("error", 0.0, 0.0);
        }

        String cleanJson = cleanJsonResponse(cleanText);
        System.out.println("CLEAN JSON quality = " + cleanJson);

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleanJson, QualityResponse.class);
        } catch (JsonProcessingException e) {
            System.out.println("❌ Quality parse error: " + e.getMessage());
            return new QualityResponse("error", 0.0, 0.0);
        }
    }

    public RiskResponse detectRisk(String emailContent) {
        String prompt = """
        Analyze this email for RISKS: aggressive language, legal issues, inappropriate tone, threats.
        Return ONLY valid JSON:
        {
          "hasRisk": false,
          "riskType": "none",
          "riskScore": 0.0,
          "recommendation": "Safe to send"
        }
        Scores 0-10. Zero = safe.

        Email: %s
        """.formatted(emailContent);

        String response = callGeminiApi(prompt);
        System.out.println("RAW risk response = " + response);
        String cleanText = extractResponseContent(response);
        System.out.println("EXTRACTED risk = " + cleanText);

        if (cleanText.startsWith("Gemini API Error") || cleanText.startsWith("Rate limited")) {
            return new RiskResponse(false, "none", 0.0, cleanText);
        }

        String cleanJson = cleanJsonResponse(cleanText);
        System.out.println("CLEAN JSON risk = " + cleanJson);

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleanJson, RiskResponse.class);
        } catch (JsonProcessingException e) {
            System.out.println("❌ Risk parse error: " + e.getMessage());
            return new RiskResponse(false, "none", 0.0, "Safe to send");
        }
    }



    private String buildPromptForVersion(String emailContent,
                                         EmailTone toneEnum,
                                         PromptVersion version) {

        String tone = toneEnum != null ? toneEnum.name().toLowerCase() : "formal";

        return switch (version) {
            case V1_SIMPLE -> """
                Reply to this email in a %s tone.
                Do not include a subject line.

                Email:
                %s
                """.formatted(tone, emailContent);

            case V2_STRUCTURED -> """
                You are a professional email assistant.

                Task: Write a clear, polite reply.
                Tone: %s
                Rules:
                - No subject line
                - Single coherent email body (no multiple options)

                Email:
                %s
                """.formatted(tone, emailContent);

            case V3_ENTERPRISE -> """
                You are an enterprise-grade email assistant.

                Objectives:
                - Be concise but complete
                - Use respectful, professional language
                - Make next steps explicit if appropriate

                Tone: %s

                Original email:
                %s
                """.formatted(tone, emailContent);
        };
    }






}