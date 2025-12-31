package com.email.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RedisTemplate<String, String> redisTemplate;

    // ✅ FIXED: Remove userId parameter, use IP instead
    public boolean isAllowed(String clientIp, String endpoint, int maxRequests, int windowSeconds) {
        String key = "rate:" + clientIp + ":" + endpoint;

        Long requests = redisTemplate.opsForValue().increment(key);
        if (requests == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
        }

        return requests <= maxRequests;
    }

}
