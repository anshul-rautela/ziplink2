package com.urlShortener.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Separate bean config to avoid circular dependency:
 * SecurityConfig -> JwtAuthFilter -> UserService -> BCryptPasswordEncoder (SecurityConfig)
 */
@Configuration
public class AppConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
