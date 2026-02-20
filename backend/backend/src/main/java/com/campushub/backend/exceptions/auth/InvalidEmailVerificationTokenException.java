package com.campushub.backend.exceptions.auth;

public class InvalidEmailVerificationTokenException extends RuntimeException {
    public InvalidEmailVerificationTokenException(String message) {
        super(message);
    }
}
