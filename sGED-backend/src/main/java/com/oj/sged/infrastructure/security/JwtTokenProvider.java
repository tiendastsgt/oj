package com.oj.sged.infrastructure.security;

import com.oj.sged.infrastructure.persistence.auth.repository.RevokedTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.oj.sged.infrastructure.persistence.auth.Usuario;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long expirationMs;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.expiration-ms}") long expirationMs,
        RevokedTokenRepository revokedTokenRepository
    ) {
        this.secretKey = buildSecretKey(secret);
        this.expirationMs = expirationMs;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            String jti = claims.get("jti", String.class);
            if (jti == null) {
                jti = claims.getId();
            }
            return jti == null || !revokedTokenRepository.existsByTokenJti(jti);
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public List<String> getRoles(String token) {
        Object roles = getClaims(token).get("roles");
        if (roles instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return Collections.emptyList();
    }

    public String getJti(String token) {
        Claims claims = getClaims(token);
        String jti = claims.get("jti", String.class);
        return jti != null ? jti : claims.getId();
    }

    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        Object userId = claims.get("user_id");
        if (userId == null) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(userId));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public LocalDateTime getExpiration(String token) {
        Claims claims = getClaims(token);
        Date expiration = claims.getExpiration();
        if (expiration == null) {
            return null;
        }
        return LocalDateTime.ofInstant(expiration.toInstant(), ZoneId.systemDefault());
    }

    public String generateToken(Usuario usuario) {
        String role = usuario.getRol() != null ? usuario.getRol().getNombre() : "";
        String juzgado = usuario.getJuzgado() != null ? usuario.getJuzgado().getNombre() : null;
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(expirationMs);

        return Jwts.builder()
            .setSubject(usuario.getUsername())
            .setId(jti)
            .claim("jti", jti)
            .claim("roles", List.of(role))
            .claim("juzgado", juzgado)
            .claim("user_id", usuario.getId())
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiration))
            .signWith(secretKey)
            .compact();
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey buildSecretKey(String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = raw.length >= 32 ? Arrays.copyOf(raw, 32) : sha256(raw);
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    private byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no disponible", ex);
        }
    }
}
