package com.urlShortener.entity;
import com.urlShortener.util.Base62Encoder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "urls")  // Changed to lowercase to match your SQL table
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class Url {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "original_url", nullable = false, columnDefinition = "TEXT")
    private String originalUrl;
    
    @Column(name = "short_code", unique = true, nullable = false, length = 255)
    // REMOVED the MySQL collation - PostgreSQL doesn't need it
    private String shortCode;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}