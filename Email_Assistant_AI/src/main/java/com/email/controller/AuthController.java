package com.email.controller;

import com.email.dto.LoginRequest;
import com.email.dto.RegisterRequest;
import com.email.entity.User;
import com.email.repository.UserRepository;
import com.email.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // ✅ VALIDATION: Check required fields
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username is required"));
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters"));
        }

        // 1. Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already taken"));
        }

        // 2. Create and save new user (with email!)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());  // ✅ SAVE EMAIL TOO

        userRepository.save(user);

        // 3. Auto-login and return token
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String jwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "user", Map.of(
                        "username", request.getUsername(),
                        "email", request.getEmail()
                ),
                "token", jwt
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String jwt = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "message", "Login successful"
            ));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }
}
