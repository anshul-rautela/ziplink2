package com.urlShortener.service;

import com.urlShortener.entity.User;
import com.urlShortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), new ArrayList<>());
    }

    public User register(String username, String email, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .build();
        return userRepository.save(user);
    }
}
