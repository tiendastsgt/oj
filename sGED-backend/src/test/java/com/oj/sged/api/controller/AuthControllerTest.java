package com.oj.sged.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.api.dto.request.ChangePasswordRequest;
import com.oj.sged.api.dto.request.LoginRequest;
import com.oj.sged.api.dto.response.LoginResponseData;
import com.oj.sged.application.service.AuthService;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import com.oj.sged.shared.exception.AuthException;
import com.oj.sged.shared.exception.PasswordValidationException;
import java.security.Principal;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;
    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void loginReturnsTokenOnSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("jperez");
        request.setPassword("Secret123");

        LoginResponseData data = Objects.requireNonNull(LoginResponseData.builder()
            .token("jwt-token")
            .username("jperez")
            .nombreCompleto("Juan Perez")
            .rol("SECRETARIO")
            .juzgado("Juzgado Primero")
            .debeCambiarPassword(false)
            .build());

        when(authService.login(eq("jperez"), eq("Secret123"), any())).thenReturn(data);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.token").value("jwt-token"));
    }

    @Test
    void loginReturns401WhenAccountBlocked() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("jperez");
        request.setPassword("Secret123");

        doThrow(new AuthException(AuthException.AuthErrorCode.ACCOUNT_BLOCKED, "Cuenta bloqueada"))
            .when(authService)
            .login(eq("jperez"), eq("Secret123"), any());

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Cuenta bloqueada. Contacte al administrador"));
    }

    @Test
    void logoutReturns401WhenMissingToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Token inválido"));
    }

    @Test
    void changePasswordReturns401WhenNoPrincipal() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPasswordActual("Actual123");
        request.setPasswordNuevo("NuevaPass1");
        request.setPasswordConfirmacion("NuevaPass1");

        mockMvc.perform(post("/api/v1/auth/cambiar-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void changePasswordReturnsValidationErrors() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPasswordActual("Actual123");
        request.setPasswordNuevo("short");
        request.setPasswordConfirmacion("short");

        doThrow(new PasswordValidationException(List.of("La contraseña nueva debe tener al menos 8 caracteres")))
            .when(authService)
            .changePassword(eq("jperez"), any(ChangePasswordRequest.class), any());

        mockMvc.perform(post("/api/v1/auth/cambiar-password")
                .contentType(MediaType.APPLICATION_JSON)
                .principal((Principal) () -> "jperez")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.errors[0]").value("La contraseña nueva debe tener al menos 8 caracteres"));
    }

    @Test
    void logoutReturnsOkWithBearerToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token-value"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
