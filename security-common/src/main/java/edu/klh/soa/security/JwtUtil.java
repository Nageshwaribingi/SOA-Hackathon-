package edu.klh.soa.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.util.Date;
public final class JwtUtil {
 private JwtUtil(){} private static final String SECRET=System.getenv().getOrDefault("JWT_SECRET","demo-only-secret-key-change-this-32chars-minimum-2026");
 private static SecretKey key(){return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));}
 public static String issue(String username,String role){long now=System.currentTimeMillis();return Jwts.builder().subject(username).claim("role",role).issuedAt(new Date(now)).expiration(new Date(now+3600000)).signWith(key()).compact();}
 public static Claims validate(String token){return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();}
}
