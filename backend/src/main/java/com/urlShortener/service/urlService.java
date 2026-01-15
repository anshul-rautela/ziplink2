package com.urlShortener.service;

import com.urlShortener.entity.Url;
import com.urlShortener.exception.InvalidCustomCodeException;
import com.urlShortener.repository.UrlRepository;
import com.urlShortener.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

//import static jdk.internal.org.jline.utils.Colors.s;

@Service
@RequiredArgsConstructor
public class urlService {
    private final UrlRepository repo;

    public long totalCount() {
        return repo.count();
    }

    public String shortenUrl(Url url, String customCode) { //changed here to added custom code
        if (customCode != null) {
            if (customCode.length() >= 3 && customCode.length() <= 10 ) {    //&& customCode.chars().allMatch(Character::isLetterOrDigit)
                if (repo.existsByShortCode(customCode)) {
                    throw new InvalidCustomCodeException(("Custom code already exists"));
                } else {
                    url.setShortCode(customCode);
                    repo.save(url);
                    return customCode;
                }
            }
            else throw new InvalidCustomCodeException("Custom code must be 3-10 characters long (e.g.  'ABC123').");
        } else {
            url = repo.save(url);
            String shortCode = Base62Encoder.encode(url.getId());
            url.setShortCode(shortCode);
            repo.save(url);
            return shortCode;
        }
    }
    public String getLinkByShortCode(String shortCode){
        Url url = repo.findByShortCode(shortCode);
        if (url == null) {
            // Handle the missing URL gracefully
            throw new RuntimeException("URL not found for code: " + shortCode);
            // Or return a default page/error string
        }
        return url.getOriginalUrl();
    }

}   
