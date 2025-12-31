package com.email.dto;


import lombok.Data;

import java.util.List;

// SummaryResponse.java
@Data
public class SummaryResponse {
    private String summary;
    private List<String> actionItems;
    private List<String> deadlines;

    // ✅ Add explicit constructor
    public SummaryResponse(String summary, List<String> actionItems, List<String> deadlines) {
        this.summary = summary;
        this.actionItems = actionItems;
        this.deadlines = deadlines;
    }

    // ✅ Default constructor (Jackson needs)
    public SummaryResponse() {}
}
