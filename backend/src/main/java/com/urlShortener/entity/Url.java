package com.urlShortener.entity;
import com.urlShortener.util.Base62Encoder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "urls")  
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class Url implements java.io.Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "original_url", nullable = false, columnDefinition = "TEXT")
    private String originalUrl;
    
    @Column(name = "short_code", unique = true, length = 255)
    private String shortCode;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_protected", nullable = false, columnDefinition = "boolean default false")
    private boolean isProtected = false;

    @Column(name = "protection_type")
    private String protectionType;

    @Column(name = "link_password")
    private String linkPassword;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "url_allowed_emails", joinColumns = @JoinColumn(name = "url_id"))
    @Column(name = "email")
    private java.util.List<String> allowedEmails;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
}