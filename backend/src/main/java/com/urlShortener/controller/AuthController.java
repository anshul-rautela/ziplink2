package com.urlShortener.controller;

import com.urlShortener.entity.User;
import com.urlShortener.service.UserService;
import com.urlShortener.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");

        if (username == null || username.isBlank() ||
            email == null || email.isBlank() ||
            password == null || password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username, email are required and password must be ≥ 6 chars"));
        }

        try {
            User user = userService.register(username, email, password);
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "token", token,
                    "username", user.getUsername(),
                    "email", user.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.get("username");
        if (identifier == null || identifier.isBlank()) {
            identifier = body.get("email");
        }
        String password = body.get("password");

        org.springframework.security.core.Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, password));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        String actualUsername = auth.getName();
        String token = jwtUtil.generateToken(actualUsername);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", actualUsername
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(Map.of("username", authentication.getName()));
    }
}
