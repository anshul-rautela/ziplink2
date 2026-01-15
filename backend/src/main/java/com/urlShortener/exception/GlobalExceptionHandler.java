package com.urlShortener.exception;

import com.urlShortener.exception.InvalidCustomCodeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice  // This tells Spring: "Hey, handle exceptions here!"
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCustomCodeException.class)  // Catches this specific exception
    public ResponseEntity<Map<String, String>> handleInvalidCustomCode(InvalidCustomCodeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)  // 400 error
                .body(Map.of("error", ex.getMessage()));  // Send error message as JSON
    }
}