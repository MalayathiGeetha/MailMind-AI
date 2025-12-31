package com.email.entity;



import com.email.dto.EmailIntent;
import com.email.dto.EmailTone;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String emailContent;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String generatedResponse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailTone tone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailIntent intent;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    // ✅ ADD USER REFERENCE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
