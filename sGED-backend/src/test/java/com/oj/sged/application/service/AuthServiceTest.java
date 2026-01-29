package com.oj.sged.application.service;

import com.oj.sged.api.dto.request.ChangePasswordRequest;
import com.oj.sged.api.dto.response.LoginResponseData;
import com.oj.sged.infrastructure.persistence.auth.AuthAttempt;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.RevokedToken;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuthAttemptRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.RevokedTokenRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import com.oj.sged.shared.exception.AuthException;
import com.oj.sged.shared.exception.PasswordValidationException;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private AuthAttemptRepository authAttemptRepository;
    @Mock
    private RevokedTokenRepository revokedTokenRepository;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        CatRol rol = CatRol.builder().id(1L).nombre("ADMINISTRADOR").build();
        CatJuzgado juzgado = CatJuzgado.builder().id(10L).nombre("Juzgado 1").build();
        usuario = Usuario.builder()
            .id(100L)
            .username("usuario")
            .password("hash")
            .nombreCompleto("Usuario Prueba")
            .email("test@oj.local")
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(1)
            .fechaCreacion(LocalDateTime.now())
            .build();
    }

    @Test
    void loginSuccessShouldReturnTokenAndResetLock() {
        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password", "hash")).thenReturn(true);
        when(jwtTokenProvider.generateToken(usuario)).thenReturn("token");

        LoginResponseData response = authService.login("usuario", "password", "10.0.0.1");

        assertEquals("token", response.getToken());
        assertEquals("usuario", response.getUsername());
        assertEquals("ADMINISTRADOR", response.getRol());
        assertEquals("Juzgado 1", response.getJuzgado());
        assertTrue(response.isDebeCambiarPassword());

        ArgumentCaptor<Usuario> userCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(userCaptor.capture());
        Usuario saved = userCaptor.getValue();
        assertEquals(0, saved.getIntentosFallidos());
        assertEquals(0, saved.getBloqueado());
        assertNull(saved.getFechaBloqueo());
        assertNotNull(saved.getFechaModificacion());

        ArgumentCaptor<AuthAttempt> attemptCaptor = ArgumentCaptor.forClass(AuthAttempt.class);
        verify(authAttemptRepository).save(attemptCaptor.capture());
        assertEquals(1, attemptCaptor.getValue().getIntentoExitoso());

        verify(auditoriaService).registrar("LOGIN", "AUTH", usuario.getId(), "Login exitoso", "10.0.0.1", "usuario");
    }

    @Test
    void loginInvalidPasswordShouldIncreaseAttempts() {
        usuario.setIntentosFallidos(1);
        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("bad", "hash")).thenReturn(false);

        AuthException ex = assertThrows(AuthException.class, () -> authService.login("usuario", "bad", "10.0.0.1"));
        assertEquals(AuthException.AuthErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());

        ArgumentCaptor<Usuario> userCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(userCaptor.capture());
        assertEquals(2, userCaptor.getValue().getIntentosFallidos());

        verify(auditoriaService).registrar("LOGIN_FAIL", "AUTH", usuario.getId(), "Credenciales inválidas", "10.0.0.1", "usuario");
    }

    @Test
    void loginShouldBlockAfterFiveFailedAttempts() {
        usuario.setIntentosFallidos(4);
        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("bad", "hash")).thenReturn(false);

        AuthException ex = assertThrows(AuthException.class, () -> authService.login("usuario", "bad", "10.0.0.1"));
        assertEquals(AuthException.AuthErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());

        ArgumentCaptor<Usuario> userCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(userCaptor.capture());
        Usuario saved = userCaptor.getValue();
        assertEquals(1, saved.getBloqueado());
        assertNotNull(saved.getFechaBloqueo());

        verify(auditoriaService).registrar("LOGIN_FAIL_LOCK", "AUTH", usuario.getId(), "Cuenta bloqueada", "10.0.0.1", "usuario");
    }

    @Test
    void loginBlockedAccountShouldReturnAccountBlocked() {
        usuario.setBloqueado(1);
        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));

        AuthException ex = assertThrows(AuthException.class, () -> authService.login("usuario", "password", "10.0.0.1"));
        assertEquals(AuthException.AuthErrorCode.ACCOUNT_BLOCKED, ex.getErrorCode());
        verify(auditoriaService).registrar("LOGIN_FAIL_LOCK", "AUTH", usuario.getId(), "Cuenta bloqueada", "10.0.0.1", "usuario");
    }

    @Test
    void logoutShouldInsertRevokedToken() {
        when(jwtTokenProvider.getJti("token")).thenReturn("jti-123");
        when(jwtTokenProvider.getExpiration("token")).thenReturn(LocalDateTime.now().plusHours(8));
        when(jwtTokenProvider.getUsername("token")).thenReturn("usuario");
        when(revokedTokenRepository.existsByTokenJti("jti-123")).thenReturn(false);

        authService.logout("token", "10.0.0.2");

        ArgumentCaptor<RevokedToken> tokenCaptor = ArgumentCaptor.forClass(RevokedToken.class);
        verify(revokedTokenRepository).save(tokenCaptor.capture());
        assertEquals("jti-123", tokenCaptor.getValue().getTokenJti());
        verify(auditoriaService).registrar("LOGOUT", "AUTH", null, "Logout exitoso", "10.0.0.2", "usuario");
    }

    @Test
    void logoutShouldBeIdempotent() {
        when(jwtTokenProvider.getJti("token")).thenReturn("jti-123");
        when(jwtTokenProvider.getExpiration("token")).thenReturn(LocalDateTime.now().plusHours(8));
        when(jwtTokenProvider.getUsername("token")).thenReturn("usuario");
        when(revokedTokenRepository.existsByTokenJti("jti-123")).thenReturn(true);

        authService.logout("token", "10.0.0.2");

        verify(revokedTokenRepository, never()).save(any(RevokedToken.class));
    }

    @Test
    void changePasswordSuccessShouldUpdatePassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPasswordActual("OldPass1");
        request.setPasswordNuevo("NewPass1");
        request.setPasswordConfirmacion("NewPass1");

        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("OldPass1", "hash")).thenReturn(true);
        when(passwordEncoder.encode("NewPass1")).thenReturn("new-hash");

        authService.changePassword("usuario", request, "10.0.0.3");

        ArgumentCaptor<Usuario> userCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(userCaptor.capture());
        assertEquals("new-hash", userCaptor.getValue().getPassword());
        assertEquals(0, userCaptor.getValue().getDebeCambiarPass());
        verify(auditoriaService).registrar("CHANGE_PASSWORD", "AUTH", usuario.getId(), "Cambio de contraseña", "10.0.0.3", "usuario");
    }

    @Test
    void changePasswordInvalidPolicyShouldThrowValidation() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPasswordActual("OldPass1");
        request.setPasswordNuevo("short");
        request.setPasswordConfirmacion("short");

        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));

        assertThrows(PasswordValidationException.class, () -> authService.changePassword("usuario", request, "10.0.0.3"));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void changePasswordIncorrectCurrentShouldThrowAuthException() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPasswordActual("WrongPass1");
        request.setPasswordNuevo("NewPass1");
        request.setPasswordConfirmacion("NewPass1");

        when(usuarioRepository.findByUsername("usuario")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("WrongPass1", "hash")).thenReturn(false);

        AuthException ex = assertThrows(AuthException.class, () -> authService.changePassword("usuario", request, "10.0.0.3"));
        assertEquals(AuthException.AuthErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
        verify(auditoriaService).registrar(eq("CHANGE_PASSWORD_FAIL"), eq("AUTH"), eq(usuario.getId()),
            eq("Contraseña actual inválida"), eq("10.0.0.3"), eq("usuario"));
    }
}
