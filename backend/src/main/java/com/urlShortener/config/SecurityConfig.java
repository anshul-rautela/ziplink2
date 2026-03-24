package com.urlShortener.config;

import com.urlShortener.filter.JwtAuthFilter;
import com.urlShortener.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder; // injected from AppConfig — breaks circular dep

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(passwordEncoder);
        provider.setUserDetailsService(userService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public endpoints — no token needed
                .requestMatchers("/auth/register", "/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/health", "/favicon.ico").permitAll()
                .requestMatchers(HttpMethod.GET, "/analytics", "/analytics/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/code/{shortCode}").permitAll()

                // Protected endpoints — require valid JWT
                .requestMatchers(HttpMethod.POST, "/shorten").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        
        // Dynamic CORS: allow from environment variable OR local development
        String frontendUrl = System.getenv("FRONTEND_URL");
        java.util.List<String> allowedOrigins = new java.util.ArrayList<>();
        allowedOrigins.add("http://localhost:3000");
        allowedOrigins.add("http://localhost:5173"); // common for Vite
        if (frontendUrl != null && !frontendUrl.isEmpty()) {
            allowedOrigins.add(frontendUrl);
            if (frontendUrl.endsWith("/")) {
                allowedOrigins.add(frontendUrl.substring(0, frontendUrl.length() - 1));
            }
        }
        
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // cache preflight for 1 hour
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
