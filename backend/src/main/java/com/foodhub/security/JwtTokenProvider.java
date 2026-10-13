package com.foodhub.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${foodhub.jwt.secret}")
    private String jwtSecret;

    @Value("${foodhub.jwt.expiration}")
    private long jwtExpirationInMs;

    private SecretKey getSignKey() {
        // Decode the 256-bit hex secret key from configuration properties
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSignKey())
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public String getRoleFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return (String) claims.get("role");
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Token is invalid or expired
        }
        return false;
    }
}
