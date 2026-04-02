package com.campushub.backend.security;

import com.campushub.backend.services.user.AppUserDetailsService;
import com.campushub.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AppUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        // DEBUG: log the incoming request path and method for tracing
        log.debug("[DEBUG] JwtAuthenticationFilter: {} {}", request.getMethod(), request.getRequestURI());

        String jwtToken = resolveToken(request);

        if (jwtToken == null) {
            // DEBUG: no JWT token found in either Authorization header or jwt cookie — request will proceed unauthenticated
            log.debug("[DEBUG] JwtAuthenticationFilter: no JWT token found in request — endpoint will reject if authentication is required");
        } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
            // DEBUG: SecurityContext already has authentication set (e.g. from a previous filter)
            log.debug("[DEBUG] JwtAuthenticationFilter: SecurityContext already has authentication, skipping JWT processing");
        } else {
            try {
                String email = jwtUtil.extractUsername(jwtToken);
                // DEBUG: log the email extracted from the token
                log.debug("[DEBUG] JwtAuthenticationFilter: extracted email from token = '{}'", email);

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                boolean tokenValid = jwtUtil.isTokenValid(jwtToken, userDetails);
                // DEBUG: log the result of token validation
                log.debug("[DEBUG] JwtAuthenticationFilter: isTokenValid = {}", tokenValid);

                if (tokenValid) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("[DEBUG] JwtAuthenticationFilter: authentication set in SecurityContext for user '{}'", email);
                } else {
                    // DEBUG: token was parsed but failed validation (expired or wrong user)
                    log.debug("[DEBUG] JwtAuthenticationFilter: token is NOT valid for user '{}' — request will proceed unauthenticated", email);
                }
            } catch (Exception e) {
                // DEBUG: exception during JWT processing — previously silently ignored, now logged
                // Common causes: malformed token, wrong secret key, expired signature, or user not found
                log.debug("[DEBUG] JwtAuthenticationFilter: exception processing JWT — type={}, message='{}'",
                        e.getClass().getSimpleName(), e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // DEBUG: JWT token extracted from Authorization header
            log.debug("[DEBUG] resolveToken: JWT found in Authorization header");
            return authHeader.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            // DEBUG: no cookies at all in request
            log.debug("[DEBUG] resolveToken: no cookies present in request, no jwt cookie to fall back on");
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                // DEBUG: JWT token extracted from jwt cookie (fallback path)
                log.debug("[DEBUG] resolveToken: JWT found in 'jwt' cookie");
                return cookie.getValue();
            }
        }

        // DEBUG: Authorization header absent/invalid and no jwt cookie found
        log.debug("[DEBUG] resolveToken: JWT not found in Authorization header or jwt cookie");
        return null;
    }
}
