package com.oj.sged.application.service;

import com.oj.sged.api.dto.request.ChangePasswordRequest;
import com.oj.sged.api.dto.response.LoginResponseData;
import com.oj.sged.infrastructure.persistence.auth.AuthAttempt;
import com.oj.sged.infrastructure.persistence.auth.RevokedToken;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuthAttemptRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.RevokedTokenRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import com.oj.sged.shared.exception.AuthException;
import com.oj.sged.shared.exception.PasswordValidationException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private final UsuarioRepository usuarioRepository;
    private final AuthAttemptRepository authAttemptRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public AuthService(
        UsuarioRepository usuarioRepository,
        AuthAttemptRepository authAttemptRepository,
        RevokedTokenRepository revokedTokenRepository,
        JwtTokenProvider jwtTokenProvider,
        PasswordEncoder passwordEncoder,
        AuditoriaService auditoriaService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.authAttemptRepository = authAttemptRepository;
        this.revokedTokenRepository = revokedTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(noRollbackFor = AuthException.class)
    public LoginResponseData login(String username, String password, String ip) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findByUsername(username);
        if (optionalUsuario.isEmpty()) {
            recordAttempt(username, ip, false);
            auditoriaService.registrar("LOGIN_FAIL", "AUTH", null, "Credenciales inválidas", ip, username);
            throw new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS, "Usuario o contraseña incorrectos");
        }

        Usuario usuario = optionalUsuario.get();
        if (usuario.getActivo() != null && usuario.getActivo() == 0) {
            recordAttempt(username, ip, false);
            auditoriaService.registrar("LOGIN_FAIL", "AUTH", usuario.getId(), "Usuario inactivo", ip, username);
            throw new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS, "Usuario o contraseña incorrectos");
        }

        if (usuario.getBloqueado() != null && usuario.getBloqueado() == 1) {
            recordAttempt(username, ip, false);
            auditoriaService.registrar("LOGIN_FAIL_LOCK", "AUTH", usuario.getId(), "Cuenta bloqueada", ip, username);
            throw new AuthException(AuthException.AuthErrorCode.ACCOUNT_BLOCKED, "Cuenta bloqueada. Contacte al administrador");
        }

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            int currentAttempts = usuario.getIntentosFallidos() == null ? 0 : usuario.getIntentosFallidos();
            int nextAttempts = currentAttempts + 1;
            usuario.setIntentosFallidos(nextAttempts);
            usuario.setFechaModificacion(LocalDateTime.now());
            if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
                usuario.setBloqueado(1);
                usuario.setFechaBloqueo(LocalDateTime.now());
                auditoriaService.registrar("LOGIN_FAIL_LOCK", "AUTH", usuario.getId(), "Cuenta bloqueada", ip, username);
            } else {
                auditoriaService.registrar("LOGIN_FAIL", "AUTH", usuario.getId(), "Credenciales inválidas", ip, username);
            }
            usuarioRepository.save(usuario);
            recordAttempt(username, ip, false);
            throw new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS, "Usuario o contraseña incorrectos");
        }

        usuario.setIntentosFallidos(0);
        usuario.setBloqueado(0);
        usuario.setFechaBloqueo(null);
        usuario.setFechaModificacion(LocalDateTime.now());
        usuarioRepository.save(usuario);
        recordAttempt(username, ip, true);

        String token = jwtTokenProvider.generateToken(usuario);
        auditoriaService.registrar("LOGIN", "AUTH", usuario.getId(), "Login exitoso", ip, username);

        String rol = usuario.getRol() != null ? usuario.getRol().getNombre() : "";
        String juzgado = usuario.getJuzgado() != null ? usuario.getJuzgado().getNombre() : "";
        boolean debeCambiarPassword = usuario.getDebeCambiarPass() != null && usuario.getDebeCambiarPass() == 1;

        return LoginResponseData.builder()
            .token(token)
            .username(usuario.getUsername())
            .nombreCompleto(usuario.getNombreCompleto())
            .rol(rol)
            .juzgado(juzgado)
            .debeCambiarPassword(debeCambiarPassword)
            .build();
    }

    public void logout(String token, String ip) {
        String jti = jwtTokenProvider.getJti(token);
        LocalDateTime expiration = jwtTokenProvider.getExpiration(token);
        if (jti == null || expiration == null) {
            throw new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS, "Token inválido");
        }

        if (!revokedTokenRepository.existsByTokenJti(jti)) {
            RevokedToken revokedToken = RevokedToken.builder()
                .tokenJti(jti)
                .fechaRevocacion(LocalDateTime.now())
                .fechaExpiracion(expiration)
                .build();
            revokedTokenRepository.save(Objects.requireNonNull(revokedToken));
        }

        String username = jwtTokenProvider.getUsername(token);
        auditoriaService.registrar("LOGOUT", "AUTH", null, "Logout exitoso", ip, username);
    }

    public void changePassword(String username, ChangePasswordRequest request, String ip) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS, "Usuario o contraseña incorrectos"));

        List<String> validationErrors = validatePasswordChange(request);
        if (!validationErrors.isEmpty()) {
            throw new PasswordValidationException(validationErrors);
        }

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
            auditoriaService.registrar("CHANGE_PASSWORD_FAIL", "AUTH", usuario.getId(), "Contraseña actual inválida", ip, usuario.getUsername());
            throw new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS, "Usuario o contraseña incorrectos");
        }

        usuario.setPassword(passwordEncoder.encode(request.getPasswordNuevo()));
        usuario.setDebeCambiarPass(0);
        usuario.setFechaModificacion(LocalDateTime.now());
        usuarioRepository.save(usuario);

        auditoriaService.registrar("CHANGE_PASSWORD", "AUTH", usuario.getId(), "Cambio de contraseña", ip, usuario.getUsername());
    }

    private void recordAttempt(String username, String ip, boolean success) {
        AuthAttempt attempt = AuthAttempt.builder()
            .username(username)
            .intentoExitoso(success ? 1 : 0)
            .ip(ip)
            .fechaIntento(LocalDateTime.now())
            .build();
        authAttemptRepository.save(Objects.requireNonNull(attempt));
    }

    private List<String> validatePasswordChange(ChangePasswordRequest request) {
        List<String> errors = new ArrayList<>();
        String newPassword = request.getPasswordNuevo();
        String confirmation = request.getPasswordConfirmacion();
        String currentPassword = request.getPasswordActual();

        if (currentPassword == null || currentPassword.isBlank()) {
            errors.add("La contraseña actual es requerida");
        }

        if (newPassword == null || newPassword.isBlank()) {
            errors.add("La contraseña nueva es requerida");
            return errors;
        }

        if (newPassword.length() < 8) {
            errors.add("La contraseña nueva debe tener al menos 8 caracteres");
        }
        if (!newPassword.matches(".*[A-Z].*")) {
            errors.add("La contraseña nueva debe incluir al menos una mayúscula");
        }
        if (!newPassword.matches(".*[a-z].*")) {
            errors.add("La contraseña nueva debe incluir al menos una minúscula");
        }
        if (!newPassword.matches(".*\\d.*")) {
            errors.add("La contraseña nueva debe incluir al menos un número");
        }
        if (confirmation == null || confirmation.isBlank()) {
            errors.add("La confirmación de la contraseña es requerida");
        } else if (!newPassword.equals(confirmation)) {
            errors.add("La confirmación no coincide");
        }
        return errors;
    }
}
