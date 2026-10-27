package edu.klh.soa.gateway;

import edu.klh.soa.security.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GatewayJwtFilter implements GlobalFilter, Ordered {

    @Override
    public int getOrder() {
        return -1;
    }

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        if (path.startsWith("/auth/") || path.equals("/actuator/health")) {
            return chain.filter(exchange);
        }

        String authorization = exchange.getRequest()
                .getHeaders()
                .getFirst("Authorization");

        try {
            if (authorization == null
                    || !authorization.startsWith("Bearer ")) {
                throw new RuntimeException("Missing bearer token");
            }

            var claims = JwtUtil.validate(authorization.substring(7));
            String role = claims.get("role", String.class);

            if (path.startsWith("/recall/")
                    && !"RECALL_OFFICER".equals(role)
                    && !"ADMIN".equals(role)) {
                return deny(exchange, HttpStatus.FORBIDDEN);
            }

            return chain.filter(exchange);

        } catch (Exception exception) {
            return deny(exchange, HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> deny(
            ServerWebExchange exchange,
            HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }
}
