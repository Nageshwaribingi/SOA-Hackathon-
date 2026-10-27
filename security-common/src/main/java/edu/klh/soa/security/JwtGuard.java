package edu.klh.soa.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/** Validates bearer JWTs at the service boundary. */
public class JwtGuard implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();

        if (path.equals("/actuator/health") || path.equals("/api/public/health")) {
            chain.doFilter(request, response);
            return;
        }

        String authorization = httpRequest.getHeader("Authorization");
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing bearer token");
            }

            Claims claims = JwtUtil.validate(authorization.substring(7));
            httpRequest.setAttribute("jwt.sub", claims.getSubject());
            httpRequest.setAttribute("jwt.role", claims.get("role", String.class));
            chain.doFilter(request, response);
        } catch (Exception exception) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                    "{\"error\":\"unauthorized\",\"message\":\"invalid, expired or missing JWT\"}"
            );
        }
    }
}
