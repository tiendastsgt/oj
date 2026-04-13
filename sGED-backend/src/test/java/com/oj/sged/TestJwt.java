package com.oj.sged;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class TestJwt {
    public static void main(String[] args) {
        try {
            System.out.println("Testing JWT generation and parsing...");
            byte[] keyBytes = "12345678901234567890123456789012".getBytes(StandardCharsets.UTF_8);
            SecretKey secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");

            String token = Jwts.builder()
                .subject("admin.qa")
                .claim("roles", "ADMIN")
                .signWith(secretKey)
                .compact();
            
            System.out.println("Token generated: " + token);
            
            String splitHeader = token.split("\\.")[0];
            System.out.println("Header part: " + splitHeader);

            System.out.println("Parsing normally:");
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
                
            System.out.println("Token parsed successfully! Subject: " + claims.getSubject());
            
            System.out.println("\nTesting token with quotes:");
            String tokenQuotes = "\"" + token + "\"";
            try {
                Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(tokenQuotes);
            } catch (Exception e) {
                System.out.println("Quotes parsing error:");
                e.printStackTrace(System.out);
            }
            
            System.out.println("\nTesting token with trailing spaces:");
            String tokenSpaces = token + "   ";
            try {
                Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(tokenSpaces);
            } catch (Exception e) {
                System.out.println("Spaces parsing error:");
                e.printStackTrace(System.out);
            }

        } catch (Exception e) {
            e.printStackTrace(System.out);
        }
    }
}
