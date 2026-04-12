package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.api.dto.request.ExpedienteRequest;
import com.oj.sged.config.AsyncTestConfig;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.CatEstado;
import com.oj.sged.infrastructure.persistence.expediente.CatTipoProceso;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.infrastructure.persistence.documento.repository.DocumentoRepository;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Supuestos de test:
 * - H2 en modo Oracle (application-test.yml) con ddl-auto.
 * - Auditoría se ejecuta sincrónicamente vía AsyncTestConfig.
 *
 * Cobertura matriz:
 * - P0: crear/listar/detalle/editar + RBAC y auditoría en éxito.
 * - P1: 404 en detalle/editar sin auditoría.
 * - P2: paginación/sort básico (ADMIN y SECRETARIO).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
class ExpedienteControllerIntegrationTest {

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
    private ExpedienteRepository expedienteRepository;
    @Autowired
    private DocumentoRepository documentoRepository;
    @Autowired
    private CatTipoProcesoRepository catTipoProcesoRepository;
    @Autowired
    private CatEstadoRepository catEstadoRepository;
    @Autowired
    private AuditoriaRepository auditoriaRepository;
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
        documentoRepository.deleteAll();
        expedienteRepository.deleteAll();
        catEstadoRepository.deleteAll();
        catTipoProcesoRepository.deleteAll();
        usuarioRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catRolRepository.deleteAll();

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
            .nombre("Tipo proceso test")
            .descripcion("Tipo proceso test")
            .activo(1)
            .build()));
        estado = catEstadoRepository.save(Objects.requireNonNull(CatEstado.builder()
            .nombre("Estado test")
            .descripcion("Estado test")
            .activo(1)
            .build()));
    }

    @Test
    void crearExpediente_admin_creaYAudita() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        ExpedienteRequest request = buildRequest("EXP-0001", juzgado2.getId());
        mockMvc.perform(withIp(post("/api/v1/expedientes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)), "10.0.0.1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.numero").value("EXP-0001"))
            .andExpect(jsonPath("$.data.juzgadoId").value(juzgado2.getId()));

        List<Expediente> expedientes = expedienteRepository.findAll();
        assertThat(expedientes).hasSize(1);
        assertThat(expedientes.get(0).getJuzgadoId()).isEqualTo(juzgado2.getId());

        List<Auditoria> auditorias = auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "CREAR_EXPEDIENTE");
        assertThat(auditorias).isNotEmpty();
        assertThat(auditorias.get(0).getRecursoId()).isEqualTo(expedientes.get(0).getId());
    }

    @Test
    void crearExpediente_secretario_mismoJuzgado_ok() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        ExpedienteRequest request = buildRequest("EXP-0002", juzgado1.getId());
        mockMvc.perform(post("/api/v1/expedientes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(expedienteRepository.findAll()).hasSize(1);
    }

    @Test
    void crearExpediente_secretario_otroJuzgado_forbidden() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        ExpedienteRequest request = buildRequest("EXP-0003", juzgado2.getId());
        mockMvc.perform(post("/api/v1/expedientes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());

        assertThat(expedienteRepository.findAll()).isEmpty();
    }

    @Test
    void crearExpediente_consulta_forbidden() throws Exception {
        Usuario consulta = createUser("consulta", "CONSULTA", juzgado1);
        String token = jwtTokenProvider.generateToken(consulta);

        ExpedienteRequest request = buildRequest("EXP-0004", juzgado1.getId());
        mockMvc.perform(post("/api/v1/expedientes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    void listarExpedientes_admin_veTodos() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        expedienteRepository.save(buildExpediente("EXP-010", juzgado1.getId(), "admin"));
        expedienteRepository.save(buildExpediente("EXP-011", juzgado2.getId(), "admin"));

        mockMvc.perform(get("/api/v1/expedientes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(2));
    }

    @Test
    void listarExpedientes_secretario_filtraPorJuzgado() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        expedienteRepository.save(buildExpediente("EXP-020", juzgado1.getId(), "admin"));
        expedienteRepository.save(buildExpediente("EXP-021", juzgado2.getId(), "admin"));

        mockMvc.perform(get("/api/v1/expedientes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(1))
            .andExpect(jsonPath("$.data.content[0].juzgadoId").value(juzgado1.getId()));
    }

    @Test
    void detalleExpediente_secretario_mismoJuzgado_audita() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        Expediente expediente = expedienteRepository.save(buildExpediente("EXP-030", juzgado1.getId(), "admin"));

        mockMvc.perform(get("/api/v1/expedientes/" + expediente.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(expediente.getId()));

        List<Auditoria> auditorias = auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "VER_EXPEDIENTE");
        assertThat(auditorias).isNotEmpty();
        assertThat(auditorias.get(0).getRecursoId()).isEqualTo(expediente.getId());
    }

    @Test
    void detalleExpediente_secretario_otroJuzgado_forbidden() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        Expediente expediente = expedienteRepository.save(buildExpediente("EXP-031", juzgado2.getId(), "admin"));

        mockMvc.perform(get("/api/v1/expedientes/" + expediente.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void detalleExpediente_inexistente_admin_404_withoutAudit() throws Exception {
        // 404 no genera auditoría: se audita solo en éxito.
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        mockMvc.perform(get("/api/v1/expedientes/99999")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNotFound());

        // No debe auditarse si no existe el recurso.
        assertThat(auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "VER_EXPEDIENTE")).isEmpty();
    }

    @Test
    void detalleExpediente_inexistente_secretario_404_withoutAudit() throws Exception {
        // 404 no genera auditoría: se audita solo en éxito.
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        mockMvc.perform(get("/api/v1/expedientes/99998")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isNotFound());

        assertThat(auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "VER_EXPEDIENTE")).isEmpty();
    }

    @Test
    void editarExpediente_admin_ok() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        Expediente expediente = expedienteRepository.save(buildExpediente("EXP-040", juzgado1.getId(), "admin"));

        ExpedienteRequest request = buildRequest("EXP-040", juzgado1.getId());
        request.setDescripcion("Descripcion actualizada");

        mockMvc.perform(put("/api/v1/expedientes/" + expediente.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.descripcion").value("Descripcion actualizada"));
    }

    @Test
    void editarExpediente_auxiliar_forbidden() throws Exception {
        Usuario auxiliar = createUser("auxiliar", "AUXILIAR", juzgado1);
        String token = jwtTokenProvider.generateToken(auxiliar);

        Expediente expediente = expedienteRepository.save(buildExpediente("EXP-050", juzgado1.getId(), "admin"));
        ExpedienteRequest request = buildRequest("EXP-050", juzgado1.getId());
        request.setDescripcion("Descripcion actualizada");

        mockMvc.perform(put("/api/v1/expedientes/" + expediente.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    void editarExpediente_inexistente_admin_404_withoutAudit() throws Exception {
        // 404 no genera auditoría: se audita solo en éxito.
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        ExpedienteRequest request = buildRequest("EXP-404", juzgado1.getId());
        mockMvc.perform(put("/api/v1/expedientes/99997")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());

        assertThat(auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "EDITAR_EXPEDIENTE")).isEmpty();
    }

    @Test
    void editarExpediente_inexistente_secretario_404_withoutAudit() throws Exception {
        // 404 no genera auditoría: se audita solo en éxito.
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        ExpedienteRequest request = buildRequest("EXP-404-2", juzgado1.getId());
        mockMvc.perform(put("/api/v1/expedientes/99996")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());

        assertThat(auditoriaRepository.findByModuloAndAccion("EXPEDIENTE", "EDITAR_EXPEDIENTE")).isEmpty();
    }

    @Test
    void listarExpedientes_paginacion_sort_desc_admin() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        Expediente older = buildExpediente("EXP-100", juzgado1.getId(), "admin");
        older.setFechaCreacion(LocalDateTime.now().minusDays(2));
        Expediente newer = buildExpediente("EXP-101", juzgado1.getId(), "admin");
        newer.setFechaCreacion(LocalDateTime.now().minusDays(1));
        Expediente newest = buildExpediente("EXP-102", juzgado2.getId(), "admin");
        newest.setFechaCreacion(LocalDateTime.now());
        expedienteRepository.saveAll(List.of(older, newer, newest));

        MvcResult result = mockMvc.perform(get("/api/v1/expedientes?page=0&size=2&sort=fechaCreacion,desc")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(2))
            .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode content = root.path("data").path("content");
        String first = content.get(0).path("fechaCreacion").asText();
        String second = content.get(1).path("fechaCreacion").asText();
        // Validación básica de orden descendente (P2: happy path).
        assertThat(first).isGreaterThanOrEqualTo(second);
    }

    @Test
    void listarExpedientes_paginacion_sort_desc_secretario() throws Exception {
        // P2: paginación/sort para SECRETARIO sobre expedientes de su juzgado.
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        Expediente older = buildExpediente("EXP-200", juzgado1.getId(), "admin");
        older.setFechaCreacion(LocalDateTime.now().minusDays(2));
        Expediente newer = buildExpediente("EXP-201", juzgado1.getId(), "admin");
        newer.setFechaCreacion(LocalDateTime.now().minusDays(1));
        Expediente newest = buildExpediente("EXP-202", juzgado1.getId(), "admin");
        newest.setFechaCreacion(LocalDateTime.now());
        Expediente otherJuzgado = buildExpediente("EXP-203", juzgado2.getId(), "admin");
        otherJuzgado.setFechaCreacion(LocalDateTime.now().plusHours(1));
        expedienteRepository.saveAll(List.of(older, newer, newest, otherJuzgado));

        MvcResult result = mockMvc.perform(get("/api/v1/expedientes?page=0&size=2&sort=fechaCreacion,desc")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content.length()").value(2))
            .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode content = root.path("data").path("content");
        String first = content.get(0).path("fechaCreacion").asText();
        String second = content.get(1).path("fechaCreacion").asText();
        assertThat(first).isGreaterThanOrEqualTo(second);
        assertThat(content.get(0).path("juzgadoId").asLong()).isEqualTo(juzgado1.getId());
        assertThat(content.get(1).path("juzgadoId").asLong()).isEqualTo(juzgado1.getId());
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

    private ExpedienteRequest buildRequest(String numero, Long juzgadoId) {
        ExpedienteRequest request = new ExpedienteRequest();
        request.setNumero(numero);
        request.setTipoProcesoId(tipoProceso.getId());
        request.setJuzgadoId(juzgadoId);
        request.setEstadoId(estado.getId());
        request.setFechaInicio(LocalDate.now());
        request.setDescripcion("Expediente de prueba");
        request.setObservaciones("Observaciones");
        request.setReferenciaSgt("SGT-001");
        request.setReferenciaFuente("SGTV2");
        return request;
    }

    private Expediente buildExpediente(String numero, Long juzgadoId, String usuarioCreacion) {
        return Objects.requireNonNull(Expediente.builder()
            .numero(numero)
            .tipoProcesoId(tipoProceso.getId())
            .juzgadoId(juzgadoId)
            .estadoId(estado.getId())
            .fechaInicio(LocalDate.now())
            .descripcion("Expediente de prueba")
            .observaciones("Observaciones")
            .referenciaSgt("SGT-001")
            .referenciaFuente("SGTV2")
            .usuarioCreacion(usuarioCreacion)
            .fechaCreacion(LocalDateTime.now())
            .build());
    }

    private MockHttpServletRequestBuilder withIp(MockHttpServletRequestBuilder builder, String ip) {
        return builder.with(request -> {
            request.setRemoteAddr(ip);
            return request;
        });
    }
}
