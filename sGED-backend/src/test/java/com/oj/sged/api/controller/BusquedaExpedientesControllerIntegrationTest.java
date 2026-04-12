package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.api.dto.request.BusquedaAvanzadaRequest;
import com.oj.sged.config.AsyncTestConfig;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuthAttemptRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.CatEstado;
import com.oj.sged.infrastructure.persistence.expediente.CatTipoProceso;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
class BusquedaExpedientesControllerIntegrationTest {

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
    private CatTipoProcesoRepository catTipoProcesoRepository;
    @Autowired
    private CatEstadoRepository catEstadoRepository;
    @Autowired
    private ExpedienteRepository expedienteRepository;
    @Autowired
    private AuditoriaRepository auditoriaRepository;
    @Autowired
    private AuthAttemptRepository authAttemptRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private CatJuzgado juzgado1;
    private CatJuzgado juzgado2;
    private CatTipoProceso tipoProceso;
    private CatEstado estado;

    @BeforeEach
    void setUp() {
        auditoriaRepository.deleteAll();
        authAttemptRepository.deleteAll();
        expedienteRepository.deleteAll();
        usuarioRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catRolRepository.deleteAll();
        catTipoProcesoRepository.deleteAll();
        catEstadoRepository.deleteAll();

        juzgado1 = catJuzgadoRepository.save(Objects.requireNonNull(CatJuzgado.builder()
            .codigo("JZ-001")
            .nombre("Juzgado 1")
            .activo(1)
            .build()));
        juzgado2 = catJuzgadoRepository.save(Objects.requireNonNull(CatJuzgado.builder()
            .codigo("JZ-002")
            .nombre("Juzgado 2")
            .activo(1)
            .build()));
        tipoProceso = catTipoProcesoRepository.save(Objects.requireNonNull(CatTipoProceso.builder()
            .nombre("Civil")
            .descripcion("Proceso civil")
            .activo(1)
            .build()));
        estado = catEstadoRepository.save(Objects.requireNonNull(CatEstado.builder()
            .nombre("Activo")
            .descripcion("Estado activo")
            .activo(1)
            .build()));
    }

    @Test
    void busquedaRapida_admin_retornaResultados() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);
        expedienteRepository.save(buildExpediente("EXP-100", juzgado1.getId()));
        expedienteRepository.save(buildExpediente("EXP-101", juzgado2.getId()));

        mockMvc.perform(get("/api/v1/expedientes/busqueda/rapida")
                .param("numero", "EXP")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(2));

        List<Auditoria> auditorias = auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "BUSQUEDA_RAPIDA");
        assertThat(auditorias).isNotEmpty();
    }

    @Test
    void busquedaRapida_secretario_filtraPorJuzgado() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);
        expedienteRepository.save(buildExpediente("EXP-200", juzgado1.getId()));
        expedienteRepository.save(buildExpediente("EXP-201", juzgado2.getId()));

        mockMvc.perform(get("/api/v1/expedientes/busqueda/rapida")
                .param("numero", "EXP")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(1))
            .andExpect(jsonPath("$.data.content[0].juzgado").value("Juzgado 1"));
    }

    @Test
    void busquedaRapida_numeroRequerido_returns400() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        mockMvc.perform(get("/api/v1/expedientes/busqueda/rapida")
                .param("numero", " ")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Error de validación"))
            .andExpect(jsonPath("$.errors[0]").value("El número es requerido"));
    }

    @Test
    void busquedaAvanzada_secretario_retornaResultados_y_audita() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);
        expedienteRepository.save(buildExpediente("EXP-300", juzgado1.getId()));
        expedienteRepository.save(buildExpediente("EXP-301", juzgado2.getId()));

        BusquedaAvanzadaRequest filtros = new BusquedaAvanzadaRequest();
        filtros.setNumero("EXP");
        filtros.setTipoProcesoId(null);
        filtros.setEstadoId(null);
        filtros.setFechaDesde(null);
        filtros.setFechaHasta(null);

        mockMvc.perform(post("/api/v1/expedientes/busqueda/avanzada")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .content(objectMapper.writeValueAsString(filtros)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(1));

        List<Auditoria> auditorias = auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "BUSQUEDA_AVANZADA");
        assertThat(auditorias).isNotEmpty();
    }

    private Usuario createUser(String username, String roleName, CatJuzgado juzgado) {
        CatRol rol = catRolRepository.findByNombre(roleName)
            .orElseGet(() -> catRolRepository.save(CatRol.builder()
                .nombre(roleName)
                .descripcion(roleName)
                .activo(1)
                .build()));
        Usuario usuario = Objects.requireNonNull(Usuario.builder()
            .username(username)
            .password(passwordEncoder.encode("Password1"))
            .nombreCompleto("Usuario " + username)
            .email(username + "@oj.local")
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build());
        return usuarioRepository.save(usuario);
    }

    private Expediente buildExpediente(String numero, Long juzgadoId) {
        return Objects.requireNonNull(Expediente.builder()
            .numero(numero)
            .tipoProcesoId(tipoProceso.getId())
            .juzgadoId(juzgadoId)
            .estadoId(estado.getId())
            .fechaInicio(LocalDate.now())
            .descripcion("Expediente de prueba")
            .usuarioCreacion("admin")
            .fechaCreacion(LocalDateTime.now())
            .build());
    }
}
