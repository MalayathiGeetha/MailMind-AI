package com.email.dto;

import lombok.Data;

@Data
public class RiskResponse {
    private boolean hasRisk;
    private String riskType;        // "aggressive", "legal", "inappropriate"
    private double riskScore;       // 0-10
    private String recommendation;
    public RiskResponse(boolean hasRisk, String riskType, double riskScore, String recommendation) {
        this.hasRisk = hasRisk;
        this.riskType = riskType;
        this.riskScore = riskScore;
        this.recommendation = recommendation;
    }

    public RiskResponse() {}// "Review before sending"
}

