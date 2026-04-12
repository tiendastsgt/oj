package com.oj.sged.infrastructure.security;

import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.RevokedTokenRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class JwtTokenProviderTest {

    private static final String SECRET = "sged-test-secret-key-should-be-at-least-32-bytes";

    @Test
    void shouldGenerateValidTokenWithClaims() {
        RevokedTokenRepository revokedTokenRepository = Mockito.mock(RevokedTokenRepository.class);
        when(revokedTokenRepository.existsByTokenJti(anyString())).thenReturn(false);
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 28_800_000L, revokedTokenRepository);

        CatRol rol = Objects.requireNonNull(CatRol.builder().id(1L).nombre("ADMINISTRADOR").build());
        CatJuzgado juzgado = Objects.requireNonNull(CatJuzgado.builder().id(2L).nombre("Juzgado Central").build());
        Usuario usuario = Objects.requireNonNull(Usuario.builder()
            .id(99L)
            .username("usuario")
            .rol(rol)
            .juzgado(juzgado)
            .build());

        LocalDateTime before = LocalDateTime.now();
        String token = provider.generateToken(usuario);
        LocalDateTime expiration = provider.getExpiration(token);

        assertNotNull(token);
        assertEquals("usuario", provider.getUsername(token));
        assertEquals(List.of("ADMINISTRADOR"), provider.getRoles(token));
        assertEquals(99L, provider.getUserId(token));
        assertTrue(provider.validateToken(token));
        assertNotNull(provider.getJti(token));

        Duration diff = Duration.between(before, expiration);
        assertTrue(diff.toMinutes() >= 479 && diff.toMinutes() <= 481);
    }

    @Test
    void validateTokenShouldFailWhenRevoked() {
        RevokedTokenRepository revokedTokenRepository = Mockito.mock(RevokedTokenRepository.class);
        when(revokedTokenRepository.existsByTokenJti(anyString())).thenReturn(true);
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 28_800_000L, revokedTokenRepository);

        Usuario usuario = Objects.requireNonNull(Usuario.builder().username("usuario").build());
        String token = provider.generateToken(usuario);

        assertFalse(provider.validateToken(token));
    }

    @Test
    void validateTokenShouldFailWhenRepositoryThrows() {
        RevokedTokenRepository revokedTokenRepository = Mockito.mock(RevokedTokenRepository.class);
        when(revokedTokenRepository.existsByTokenJti(anyString())).thenThrow(new RuntimeException("db error"));
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 28_800_000L, revokedTokenRepository);

        Usuario usuario = Objects.requireNonNull(Usuario.builder().username("usuario").build());
        String token = provider.generateToken(usuario);

        assertFalse(provider.validateToken(token));
    }

    @Test
    void validateTokenShouldFailForInvalidToken() {
        RevokedTokenRepository revokedTokenRepository = Mockito.mock(RevokedTokenRepository.class);
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 28_800_000L, revokedTokenRepository);

        assertFalse(provider.validateToken("invalid-token"));
    }
}
