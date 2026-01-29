package com.oj.sged.api.controller;

import com.oj.sged.api.dto.request.ChangePasswordRequest;
import com.oj.sged.api.dto.request.LoginRequest;
import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.LoginResponseData;
import com.oj.sged.api.dto.response.ValidationErrorResponse;
import com.oj.sged.application.service.AuthService;
import com.oj.sged.shared.exception.AuthException;
import com.oj.sged.shared.exception.PasswordValidationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseData>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        try {
            LoginResponseData responseData = authService.login(request.getUsername(), request.getPassword(), ip);
            ApiResponse<LoginResponseData> response = ApiResponse.<LoginResponseData>builder()
                .success(true)
                .data(responseData)
                .timestamp(java.time.Instant.now())
                .build();
            return ResponseEntity.ok(response);
        } catch (AuthException ex) {
            if (ex.getErrorCode() == AuthException.AuthErrorCode.ACCOUNT_BLOCKED) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Cuenta bloqueada. Contacte al administrador"));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Usuario o contraseña incorrectos"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Token inválido"));
        }
        String token = authHeader.substring(7);
        authService.logout(token, ip);
        return ResponseEntity.ok(ApiResponse.ok("Sesión cerrada correctamente", null));
    }

    @PostMapping("/cambiar-password")
    public ResponseEntity<?> changePassword(
        @RequestBody ChangePasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        String username = httpRequest.getUserPrincipal() != null ? httpRequest.getUserPrincipal().getName() : null;
        String ip = httpRequest.getRemoteAddr();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Usuario o contraseña incorrectos"));
        }
        try {
            authService.changePassword(username, request, ip);
            return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada correctamente", null));
        } catch (PasswordValidationException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ValidationErrorResponse.of("Error de validación", ex.getErrors()));
        } catch (AuthException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Usuario o contraseña incorrectos"));
        }
    }
}
