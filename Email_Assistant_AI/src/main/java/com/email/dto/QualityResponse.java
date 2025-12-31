package com.email.dto;

import lombok.Data;

@Data
public class QualityResponse {
    private String emailContent;
    private double politenessScore;    // 0-10
    private double professionalismScore; // 0-10
    private String sentiment;

    // ✅ EXACT 3-PARAM CONSTRUCTOR
    public QualityResponse(String sentiment, double politenessScore, double professionalismScore) {
        this.sentiment = sentiment;
        this.politenessScore = politenessScore;
        this.professionalismScore = professionalismScore;
    }

    public QualityResponse() {}// positive/neutral/negative
}

