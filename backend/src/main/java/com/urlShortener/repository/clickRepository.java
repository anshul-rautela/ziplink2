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

        @Query("SELECT CAST(c.clickedAt AS date) as date, COUNT(c) as count " +
           "FROM Click c " +
           "WHERE c.shortCode = :shortCode " +
           "AND c.clickedAt >= :startDate " +
           "GROUP BY CAST(c.clickedAt AS date) " +
           "ORDER BY date DESC")
    List<Object[]> getClicksByDay(@Param("shortCode") String shortCode,
                                  @Param("startDate") LocalDateTime startDate);
}
