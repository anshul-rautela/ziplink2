package com.urlShortener.controller;

import com.urlShortener.entity.Click;
import com.urlShortener.entity.Url;
import com.urlShortener.repository.clickRepository;
import com.urlShortener.service.urlService;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
public class UrlController {
    private final urlService service;
    private final clickRepository clickRepository;

    @PostMapping("/shorten")
    public Map<String, String> shorten(@RequestBody Map<String, String> payload) {
        Url url = Url.builder().originalUrl(payload.get("originalUrl")).build();
        String shortCode = service.shortenUrl(url, payload.get("customCode"));
        return Map.of("shortCode", shortCode);
    }

    @GetMapping("/{shortCode}")
    public RedirectView redirect(@PathVariable String shortCode) {
        RedirectView rv = new RedirectView();
        String newUrl = service.getLinkByShortCode(shortCode);
        rv.setUrl(newUrl);
        //inserting it into clickRepo
        Click click = Click.builder()
                .shortCode(shortCode)
                .clickedAt(LocalDateTime.now()).build();
        clickRepository.save(click);

        return rv;
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    @GetMapping("/analytics/{shortCode}")
    public Map<String, Object> getAnalytics(@PathVariable String shortCode) {
        // Total clicks
        Long totalClicks = clickRepository.countByShortCode(shortCode);

        // Last 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> dailyClicks = clickRepository.getClicksByDay(shortCode, sevenDaysAgo);

        // Convert to proper format
        List<Map<String, Object>> clicksByDay = dailyClicks.stream()
                .map(row -> Map.of(
                        "date", row[0].toString(),
                        "clicks", row[1]
                ))
                .toList();

        return Map.of(
                "totalClicks", totalClicks,
                "clicksByDay", clicksByDay
        );
    }

}
