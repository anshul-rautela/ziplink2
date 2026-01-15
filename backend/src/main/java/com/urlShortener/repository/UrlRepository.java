package com.urlShortener.repository;

import com.urlShortener.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UrlRepository extends JpaRepository<Url,Long> {
    // add method findByShortCode(String code);
    public Url findByShortCode(String code);
    public boolean existsByShortCode(String customCode);
}
