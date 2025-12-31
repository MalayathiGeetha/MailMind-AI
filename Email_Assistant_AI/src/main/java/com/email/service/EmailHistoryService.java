package com.email.service;


import com.email.entity.EmailHistory;
import com.email.entity.User;
import com.email.repository.EmailHistoryRepository;
import com.email.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@AllArgsConstructor
public class EmailHistoryService {
    private final EmailHistoryRepository repository;
    private final UserRepository userRepository;

    public EmailHistory save(EmailHistory history) {
        return repository.save(history);
    }

    public List<EmailHistory> getUserHistory(String username) {
        return repository.findByUser_UsernameOrderByTimestampDesc(username);
    }

    public List<EmailHistory> getByIntent(com.email.dto.EmailIntent intent) {
        return repository.findByIntent(intent);
    }

    // ✅ NEW: For Dashboard
    public long countByUserUsername(String username) {
        return repository.countByUser_Username(username);
    }

    public List<EmailHistory> getRecentEmailsByUsername(String username, int limit) {
        return repository.findByUserUsernameOrderByTimestampDesc(username, limit);
    }
}
