package com.urlShortener.repository;

import com.urlShortener.entity.Click;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface clickRepository extends JpaRepository<Click,Long> {
    Long countByShortCode(String shortCode);//It runs this: SELECT COUNT(*) FROM clicks WHERE short_code = 'abc123'

        @Query("SELECT CAST(c.clickedAt AS date) as d, COUNT(c) FROM Click c WHERE c.shortCode = :shortCode AND c.clickedAt >= :startDate GROUP BY CAST(c.clickedAt AS date) ORDER BY d DESC")
    List<Object[]> getClicksByDay(@Param("shortCode") String shortCode,
                                  @Param("startDate") LocalDateTime startDate);

    @Query("SELECT c.referrer, COUNT(c) FROM Click c WHERE c.shortCode = :shortCode GROUP BY c.referrer")
    List<Object[]> getReferrerStats(@Param("shortCode") String shortCode);

    @Query("SELECT c.device, COUNT(c) FROM Click c WHERE c.shortCode = :shortCode GROUP BY c.device")
    List<Object[]> getDeviceStats(@Param("shortCode") String shortCode);

    @Query("SELECT c.browser, COUNT(c) FROM Click c WHERE c.shortCode = :shortCode GROUP BY c.browser")
    List<Object[]> getBrowserStats(@Param("shortCode") String shortCode);

    @Query("SELECT c.platform, COUNT(c) FROM Click c WHERE c.shortCode = :shortCode GROUP BY c.platform")
    List<Object[]> getPlatformStats(@Param("shortCode") String shortCode);
}
