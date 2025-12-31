// src/main/java/com/email/controller/UserController.java
package com.email.controller;

import com.email.dto.ProviderRequest;
import com.email.dto.UserDashboard;
import com.email.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserDetailsServiceImpl userService;

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboard> getDashboard(Authentication auth) {
        UserDashboard dashboard = userService.getUserDashboard(auth.getName());
        return ResponseEntity.ok(dashboard);
    }

    // ADD THIS METHOD to UserController
    @PutMapping("/ai-provider")
    public ResponseEntity<String> setProvider(
            @RequestBody ProviderRequest request,
            Authentication auth) {
        userService.setPreferredAiProvider(auth.getName(), request.getProvider());
        return ResponseEntity.ok("✅ AI Provider switched to " + request.getProvider());
    }

}
