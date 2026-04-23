package com.urlShortener;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BitlyCloneApplication {

	public static void main(String[] args) {
		SpringApplication.run(BitlyCloneApplication.class, args);
	}

}
