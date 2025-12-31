package com.email.service;

import com.email.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ✅ FIXED: Simple IP-based rate limiting (no JWT needed)
        String clientIp = getClientIpAddress(request);
        String endpoint = request.getRequestURI();

        // 10 requests per minute per IP
        boolean allowed = rateLimitService.isAllowed(clientIp, endpoint, 10, 60);

        if (!allowed) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("Rate limit exceeded. Try again in 1 minute.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    // ✅ IMPLEMENTED: Get client IP
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
