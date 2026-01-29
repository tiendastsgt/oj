package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.config.AsyncTestConfig;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuthAttemptRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.RevokedTokenRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private CatRolRepository catRolRepository;
    @Autowired
    private CatJuzgadoRepository catJuzgadoRepository;
    @Autowired
    private AuthAttemptRepository authAttemptRepository;
    @Autowired
    private AuditoriaRepository auditoriaRepository;
    @Autowired
    private RevokedTokenRepository revokedTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        authAttemptRepository.deleteAll();
        revokedTokenRepository.deleteAll();
        auditoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catRolRepository.deleteAll();
    }

    @Test
    void loginSuccessShouldReturnTokenAndAudit() throws Exception {
        Usuario usuario = createUser("usuario", "Password1");

        mockMvc.perform(withIp(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"usuario\",\"password\":\"Password1\"}"), "10.0.0.1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.token").isNotEmpty())
            .andExpect(jsonPath("$.data.username").value("usuario"))
            .andExpect(jsonPath("$.data.rol").value("ADMINISTRADOR"))
            .andExpect(jsonPath("$.data.juzgado").value("Juzgado Central"));

        assertThat(authAttemptRepository.findByUsernameOrderByFechaIntentoDesc("usuario")).hasSize(1);
        List<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc("usuario");
        assertThat(auditorias).isNotEmpty();
        assertThat(auditorias.get(0).getAccion()).isEqualTo("LOGIN");
    }

    @Test
    void loginInvalidPasswordShouldReturn401AndIncreaseAttempts() throws Exception {
        Usuario usuario = createUser("usuario", "Password1");

        mockMvc.perform(withIp(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"usuario\",\"password\":\"BadPass1\"}"), "10.0.0.2"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuario o contraseña incorrectos"));

        Usuario updated = usuarioRepository.findById(usuario.getId()).orElseThrow();
        assertThat(updated.getIntentosFallidos()).isEqualTo(1);
        assertThat(authAttemptRepository.findByUsernameOrderByFechaIntentoDesc("usuario")).hasSize(1);
        List<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc("usuario");
        assertThat(auditorias.get(0).getAccion()).isEqualTo("LOGIN_FAIL");
    }

    @Test
    void loginShouldBlockAfterFiveFailedAttempts() throws Exception {
        Usuario usuario = createUser("usuario", "Password1");
        usuario.setIntentosFallidos(4);
        usuarioRepository.save(usuario);

        mockMvc.perform(withIp(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"usuario\",\"password\":\"BadPass1\"}"), "10.0.0.3"))
            .andExpect(status().isUnauthorized());

        Usuario updated = usuarioRepository.findById(usuario.getId()).orElseThrow();
        assertThat(updated.getBloqueado()).isEqualTo(1);
        assertThat(updated.getFechaBloqueo()).isNotNull();
        List<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc("usuario");
        assertThat(auditorias.get(0).getAccion()).isEqualTo("LOGIN_FAIL_LOCK");
    }

    @Test
    void loginBlockedAccountShouldReturnBlockedMessage() throws Exception {
        Usuario usuario = createUser("usuario", "Password1");
        usuario.setBloqueado(1);
        usuarioRepository.save(usuario);

        mockMvc.perform(withIp(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"usuario\",\"password\":\"Password1\"}"), "10.0.0.3"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Cuenta bloqueada. Contacte al administrador"));
    }

    @Test
    void logoutShouldRevokeToken() throws Exception {
        Usuario usuario = createUser("usuario", "Password1");
        String token = jwtTokenProvider.generateToken(usuario);
        String jti = jwtTokenProvider.getJti(token);

        mockMvc.perform(withIp(post("/api/v1/auth/logout")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token), "10.0.0.4"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Sesión cerrada correctamente"));

        assertThat(revokedTokenRepository.existsByTokenJti(jti)).isTrue();
        List<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc("usuario");
        assertThat(auditorias.get(0).getAccion()).isEqualTo("LOGOUT");
    }

    @Test
    void revokedTokenShouldNotAccessProtectedEndpoint() throws Exception {
        Usuario usuario = createUser("usuario", "Password1");
        String token = jwtTokenProvider.generateToken(usuario);

        mockMvc.perform(post("/api/v1/auth/logout")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/protected/ping")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void changePasswordShouldUpdatePassword() throws Exception {
        Usuario usuario = createUser("usuario", "OldPass1");
        String token = jwtTokenProvider.generateToken(usuario);

        String body = objectMapper.writeValueAsString(new ChangePasswordBody("OldPass1", "NewPass1", "NewPass1"));
        mockMvc.perform(post("/api/v1/auth/cambiar-password")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Contraseña actualizada correctamente"));

        Usuario updated = usuarioRepository.findById(usuario.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("NewPass1", updated.getPassword())).isTrue();
        assertThat(updated.getDebeCambiarPass()).isEqualTo(0);
        List<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc("usuario");
        assertThat(auditorias.get(0).getAccion()).isEqualTo("CHANGE_PASSWORD");
    }

    @Test
    void changePasswordPolicyFailureShouldReturn400() throws Exception {
        Usuario usuario = createUser("usuario", "OldPass1");
        String token = jwtTokenProvider.generateToken(usuario);

        String body = objectMapper.writeValueAsString(new ChangePasswordBody("OldPass1", "short", "short"));
        mockMvc.perform(post("/api/v1/auth/cambiar-password")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Error de validación"))
            .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void changePasswordIncorrectCurrentShouldReturn401() throws Exception {
        Usuario usuario = createUser("usuario", "OldPass1");
        String token = jwtTokenProvider.generateToken(usuario);

        String body = objectMapper.writeValueAsString(new ChangePasswordBody("WrongPass1", "NewPass1", "NewPass1"));
        mockMvc.perform(post("/api/v1/auth/cambiar-password")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .content(body))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuario o contraseña incorrectos"));

        List<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc("usuario");
        assertThat(auditorias.get(0).getAccion()).isEqualTo("CHANGE_PASSWORD_FAIL");
    }

    private Usuario createUser(String username, String rawPassword) {
        CatRol rol = catRolRepository.save(CatRol.builder()
            .nombre("ADMINISTRADOR")
            .descripcion("Administrador")
            .activo(1)
            .build());
        CatJuzgado juzgado = catJuzgadoRepository.save(CatJuzgado.builder()
            .codigo("JUZ-001")
            .nombre("Juzgado Central")
            .activo(1)
            .build());
        Usuario usuario = Usuario.builder()
            .username(username)
            .password(passwordEncoder.encode(rawPassword))
            .nombreCompleto("Usuario Prueba")
            .email("usuario@oj.local")
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(1)
            .fechaCreacion(LocalDateTime.now())
            .build();
        return usuarioRepository.save(usuario);
    }

    private MockHttpServletRequestBuilder withIp(MockHttpServletRequestBuilder builder, String ip) {
        return builder.with(request -> {
            request.setRemoteAddr(ip);
            return request;
        });
    }

    private record ChangePasswordBody(String passwordActual, String passwordNuevo, String passwordConfirmacion) {
    }
}
