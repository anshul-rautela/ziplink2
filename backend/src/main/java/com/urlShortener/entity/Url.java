package com.urlShortener.entity;

import com.urlShortener.util.Base62Encoder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name ="Urls")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class Url {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name="original_url")
    private String originalUrl;
    @Column(
            name = "short_code",
            unique = true,
            nullable = false,
            columnDefinition = "VARCHAR(10) COLLATE utf8mb4_bin" // This is for MySQL to treat 'a' and 'A' differently
    )
    private String shortCode;
    @CreationTimestamp
    @Column(name="created_at" ,nullable = false, updatable = false)
    private LocalDateTime createdAt;

        //added new fnality for not caling db 2 times
//        @PostPersist
//        public void generateShortCode() {
//            this.shortCode = Base62Encoder.encode(this.id);
//        }
    }
