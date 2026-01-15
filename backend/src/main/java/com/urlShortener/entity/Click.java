package com.urlShortener.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Click {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String shortCode;
    LocalDateTime clickedAt;
}
