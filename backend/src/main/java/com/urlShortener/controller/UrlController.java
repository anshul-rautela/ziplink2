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
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.server.ResponseStatusException;
import com.urlShortener.repository.UserRepository;

@RequiredArgsConstructor
@RestController
public class UrlController {
    private final urlService service;
    private final clickRepository clickRepository;
    private final UserRepository userRepository;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(status);
    }
    @PostMapping("/shorten")
    public Map<String, String> shorten(@RequestBody Map<String, String> payload, Principal principal) {
        Url url = Url.builder().originalUrl(payload.get("originalUrl")).build();
        if (principal != null) {
            userRepository.findByUsername(principal.getName()).ifPresent(url::setUser);
        }
        String shortCode = service.shortenUrl(url, payload.get("customCode"));
        return Map.of("shortCode", shortCode);
    }



    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    @GetMapping("/analytics")
    public List<Map<String, Object>> getAllAnalytics(Principal principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to view analytics");
        return service.getUrlsByUser(principal.getName()).stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("shortCode", u.getShortCode());
                    m.put("originalUrl", u.getOriginalUrl());
                    m.put("createdAt", u.getCreatedAt());
                    m.put("totalClicks", clickRepository.countByShortCode(u.getShortCode()));
                    return m;
                }).collect(Collectors.toList());
    }

    @GetMapping("/analytics/{shortCode}")
    public Map<String, Object> getAnalytics(@PathVariable String shortCode, Principal principal) {
        Url url = service.getUrlByShortCode(shortCode.trim());
        if (url == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "URL not found");

        // Privacy check (Removed to allow public analytics as requested)
        /*
        if (url.getUser() != null) {
            if (principal == null || !url.getUser().getUsername().equals(principal.getName())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This URL is private to its creator");
            }
        }
        */

        // Use the official shortCode from the URL entity for queries to ensure case-consistency
        String officialCode = url.getShortCode();
        Long totalClicks = clickRepository.countByShortCode(officialCode);

        // Daily (last 30 days) stats using officialCode
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> dailyData = clickRepository.getClicksByDay(officialCode, thirtyDaysAgo);
        
        // Referrer, Device, Browser Stats using officialCode
        List<Object[]> referrers = clickRepository.getReferrerStats(officialCode);
        List<Object[]> devices = clickRepository.getDeviceStats(officialCode);
        List<Object[]> browsers = clickRepository.getBrowserStats(officialCode);
        List<Object[]> platforms = clickRepository.getPlatformStats(officialCode);

        Map<String, Object> response = new HashMap<>();
        response.put("shortCode", officialCode);
        response.put("totalClicks", totalClicks);
        response.put("dailyClicks", formatStats(dailyData, "date"));
        response.put("referrers", formatStats(referrers, "name"));
        response.put("devices", formatStats(devices, "name"));
        response.put("browsers", formatStats(browsers, "name"));
        response.put("platforms", formatStats(platforms, "name"));

        return response;
    }

    private List<Map<String, Object>> formatStats(List<Object[]> data, String keyName) {
        return data.stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put(keyName, row[0] != null ? row[0].toString() : "Unknown");
                    m.put("count", row[1]);
                    return m;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/code/{shortCode}")
    public RedirectView redirect(@PathVariable String shortCode, 
                                 HttpServletRequest request,
                                 @RequestHeader(value = "User-Agent", required = false) String userAgent,
                                 @RequestHeader(value = "Referer", required = false) String referer) {
        
        RedirectView rv = new RedirectView();
        Url urlEntity = service.getUrlByShortCode(shortCode.trim());
        if (urlEntity == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "URL not found");
        
        String officialCode = urlEntity.getShortCode();
        String newUrl = urlEntity.getOriginalUrl();
        rv.setUrl(newUrl);

        // Advanced Analytics Collection
        String device = "Desktop";
        if (userAgent != null) {
            String lowerUA = userAgent.toLowerCase();
            if (lowerUA.contains("mobile") || lowerUA.contains("android") || lowerUA.contains("iphone")) {
                device = "Mobile";
            } else if (lowerUA.contains("tablet") || lowerUA.contains("ipad")) {
                device = "Tablet";
            }
        }

        String browser = "Other";
        if (userAgent != null) {
            String lowerUA = userAgent.toLowerCase();
            if (lowerUA.contains("chrome")) browser = "Chrome";
            else if (lowerUA.contains("firefox")) browser = "Firefox";
            else if (lowerUA.contains("safari") && !lowerUA.contains("chrome")) browser = "Safari";
            else if (lowerUA.contains("edge")) browser = "Edge";
        }

        String platform = "Other";
        if (userAgent != null) {
            String lowerUA = userAgent.toLowerCase();
            if (lowerUA.contains("windows")) platform = "Windows";
            else if (lowerUA.contains("mac os")) platform = "MacOS";
            else if (lowerUA.contains("linux")) platform = "Linux";
            else if (lowerUA.contains("android")) platform = "Android";
            else if (lowerUA.contains("iphone") || lowerUA.contains("ipad")) platform = "iOS";
        }

        String refMod = "Direct / Referral";
        if (referer != null) {
            String lowerRef = referer.toLowerCase();
            if (lowerRef.contains("google")) refMod = "Google Search";
            else if (lowerRef.contains("facebook") || lowerRef.contains("fb")) refMod = "Facebook";
            else if (lowerRef.contains("whatsapp") || lowerRef.contains("wa.me")) refMod = "WhatsApp";
            else if (lowerRef.contains("twitter") || lowerRef.contains("t.co")) refMod = "Twitter / X";
            else if (lowerRef.contains("instagram")) refMod = "Instagram";
            else if (lowerRef.contains("linkedin")) refMod = "LinkedIn";
        } else if (userAgent != null) {
            String lowerUA = userAgent.toLowerCase();
            if (lowerUA.contains("whatsapp")) refMod = "WhatsApp App";
            else if (lowerUA.contains("fbios") || lowerUA.contains("fb_iab")) refMod = "Facebook App";
            else if (lowerUA.contains("instagram")) refMod = "Instagram App";
            else if (lowerUA.contains("twitter")) refMod = "Twitter App";
        }

        Click click = Click.builder()
                .shortCode(officialCode)
                .clickedAt(LocalDateTime.now())
                .ipAddress(request.getRemoteAddr())
                .userAgent(userAgent)
                .referrer(refMod)
                .device(device)
                .browser(browser)
                .platform(platform)
                .build();
        clickRepository.save(click);

        return rv;
    }
}
