package com.email.repository;

import com.email.entity.EmailHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailHistoryRepository extends JpaRepository<EmailHistory, Long> {
    List<EmailHistory> findByUser_UsernameOrderByTimestampDesc(String username);

    List<EmailHistory> findByIntent(com.email.dto.EmailIntent intent);


    @Query("SELECT e FROM EmailHistory e WHERE e.user.username = :username ORDER BY e.timestamp DESC LIMIT :limit")
    List<EmailHistory> findByUserUsernameOrderByTimestampDesc(@Param("username") String username, @Param("limit") int limit);

    long countByUser_Username(String username);

    @Query("select h.tone as tone, count(h) as cnt " +
            "from EmailHistory h where h.user.username = :username group by h.tone")
    List<Object[]> countByToneForUser(@Param("username") String username);

    @Query("select h.intent as intent, count(h) as cnt " +
            "from EmailHistory h where h.user.username = :username group by h.intent")
    List<Object[]> countByIntentForUser(@Param("username") String username);

    @Query("select avg(length(h.emailContent)) " +
            "from EmailHistory h where h.user.username = :username")
    Double avgEmailLengthByUser(@Param("username") String username);

    // When you later add a confidenceScore field:
    // @Query("select avg(h.confidenceScore) from EmailHistory h where h.user.username = :username")
    // Double avgConfidenceByUser(@Param("username") String username);
}
