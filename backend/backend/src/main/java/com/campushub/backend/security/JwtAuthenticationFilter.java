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
        System.out.println("[DEBUG][JwtFilter] >>> Incoming request: " + request.getMethod() + " " + request.getRequestURI());
        log.debug("[DEBUG] JwtAuthenticationFilter: {} {}", request.getMethod(), request.getRequestURI());

        String jwtToken = resolveToken(request);

        if (jwtToken == null) {
            System.out.println("[DEBUG][JwtFilter] No JWT token found — request will proceed unauthenticated (endpoint may reject it)");
            log.debug("[DEBUG] JwtAuthenticationFilter: no JWT token found in request — endpoint will reject if authentication is required");
        } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("[DEBUG][JwtFilter] SecurityContext already has authentication — skipping JWT processing");
            log.debug("[DEBUG] JwtAuthenticationFilter: SecurityContext already has authentication, skipping JWT processing");
        } else {
            System.out.println("[DEBUG][JwtFilter] JWT token found — attempting to authenticate");
            try {
                String email = jwtUtil.extractUsername(jwtToken);
                System.out.println("[DEBUG][JwtFilter] Extracted email from token: '" + email + "'");
                log.debug("[DEBUG] JwtAuthenticationFilter: extracted email from token = '{}'", email);

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                System.out.println("[DEBUG][JwtFilter] Loaded UserDetails for: '" + email + "', authorities: " + userDetails.getAuthorities());
                boolean tokenValid = jwtUtil.isTokenValid(jwtToken, userDetails);
                System.out.println("[DEBUG][JwtFilter] isTokenValid = " + tokenValid);
                log.debug("[DEBUG] JwtAuthenticationFilter: isTokenValid = {}", tokenValid);

                if (tokenValid) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("[DEBUG][JwtFilter] Authentication set in SecurityContext for user '" + email + "'");
                    log.debug("[DEBUG] JwtAuthenticationFilter: authentication set in SecurityContext for user '{}'", email);
                } else {
                    System.out.println("[DEBUG][JwtFilter] Token is NOT valid for user '" + email + "' — proceeding unauthenticated");
                    log.debug("[DEBUG] JwtAuthenticationFilter: token is NOT valid for user '{}' — request will proceed unauthenticated", email);
                }
            } catch (Exception e) {
                System.out.println("[DEBUG][JwtFilter] Exception processing JWT — type=" + e.getClass().getSimpleName() + ", message='" + e.getMessage() + "'");
                log.debug("[DEBUG] JwtAuthenticationFilter: exception processing JWT — type={}, message='{}'",
                        e.getClass().getSimpleName(), e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        System.out.println("[DEBUG][JwtFilter] SecurityContext auth after filter: " + SecurityContextHolder.getContext().getAuthentication());

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        System.out.println("[DEBUG][JwtFilter] Authorization header: " + (authHeader != null ? (authHeader.startsWith("Bearer ") ? "Bearer ***present***" : "present but not Bearer: " + authHeader) : "null/missing"));
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("[DEBUG] resolveToken: JWT found in Authorization header");
            return authHeader.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            System.out.println("[DEBUG][JwtFilter] No cookies present in request");
            log.debug("[DEBUG] resolveToken: no cookies present in request, no jwt cookie to fall back on");
            return null;
        }

        System.out.println("[DEBUG][JwtFilter] Cookies present: " + cookies.length + " — looking for 'jwt' cookie");
        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                System.out.println("[DEBUG][JwtFilter] Found 'jwt' cookie — using as token");
                log.debug("[DEBUG] resolveToken: JWT found in 'jwt' cookie");
                return cookie.getValue();
            }
        }

        System.out.println("[DEBUG][JwtFilter] JWT not found in Authorization header or 'jwt' cookie — returning null");
        log.debug("[DEBUG] resolveToken: JWT not found in Authorization header or jwt cookie");
        return null;
    }
}
