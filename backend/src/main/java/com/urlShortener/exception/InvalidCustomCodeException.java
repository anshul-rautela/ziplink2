package com.urlShortener.exception;


public class InvalidCustomCodeException extends RuntimeException {
    public InvalidCustomCodeException(String message) {
        super(message);
    }
}
