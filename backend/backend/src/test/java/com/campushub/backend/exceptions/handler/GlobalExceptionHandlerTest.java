package com.campushub.backend.exceptions.handler;

import com.campushub.backend.exceptions.user.UserAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlesConflictWithFriendlyMessage() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/auth/register");

        var response = handler.handleUserAlreadyExists(new UserAlreadyExistsException("Username is already in use"), request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Username is already in use", response.getBody().message());
        assertEquals("/auth/register", response.getBody().path());
    }

    @Test
    void handlesBadCredentialsWithGenericMessage() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/auth/login");

        var response = handler.handleBadCredentials(new BadCredentialsException("Bad credentials"), request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid username or password.", response.getBody().message());
    }

    @Test
    void handlesValidationErrorsWithDetails() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "userRequestDTO");
        bindingResult.addError(new FieldError("userRequestDTO", "email", "Email must be valid"));
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("sampleMethod", String.class), 0
        );
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(methodParameter, bindingResult);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/auth/register");

        var response = handler.handleValidationException(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed. Please check your input and try again.", response.getBody().message());
        assertEquals(List.of("email: Email must be valid"), response.getBody().details());
        assertNotNull(response.getBody().timestamp());
    }

    private void sampleMethod(String input) {
    }
}
