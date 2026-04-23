package com.campushub.backend.exceptions;

import com.campushub.backend.exceptions.listing.ListingNotAvailableException;
import com.campushub.backend.exceptions.user.EmailAlreadyExistsException;
import com.campushub.backend.exceptions.user.UserNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        System.out.println("[DEBUG][GlobalExceptionHandler] Validation error: " + message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", message));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        System.out.println("[DEBUG][GlobalExceptionHandler] ResponseStatusException: " + message);
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", message));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        System.out.println("[DEBUG][GlobalExceptionHandler] EmailAlreadyExistsException: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "An account with this email address already exists. Please log in or use a different email."));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException ex) {
        System.out.println("[DEBUG][GlobalExceptionHandler] UserNotFoundException: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(ListingNotAvailableException.class)
    public ResponseEntity<Map<String, String>> handleListingNotAvailable(ListingNotAvailableException ex) {
        System.out.println("[DEBUG][GlobalExceptionHandler] ListingNotAvailableException: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        System.out.println("[DEBUG][GlobalExceptionHandler] IllegalArgumentException: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        System.out.println("[DEBUG][GlobalExceptionHandler] DataIntegrityViolationException: " + ex.getMessage());
        String message = "The operation could not be completed due to a data conflict.";
        String cause = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (cause.contains("key (username)") || cause.contains("users_username_key")) {
            message = "This username is already taken. Please choose a different username.";
        } else if (cause.contains("key (phone_number)") || cause.contains("users_phone_number_key")) {
            message = "This phone number is already registered. Please use a different phone number.";
        } else if (cause.contains("key (email)") || cause.contains("users_email_key")) {
            message = "An account with this email address already exists.";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
    }
}
