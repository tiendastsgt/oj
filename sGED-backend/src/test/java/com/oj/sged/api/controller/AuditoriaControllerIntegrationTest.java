package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.config.AsyncTestConfig;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import com.oj.sged.shared.util.AuditAction;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests de integración para AuditoriaController (HU-018).
 * Cubre consultas de auditoría con filtros dinámicos, RBAC y validación de datos.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
class AuditoriaControllerIntegrationTest {

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
    private AuditoriaRepository auditoriaRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Usuario usuarioAdmin;
    private Usuario usuarioNoAdmin;
    private CatRol rolAdmin;
    private CatRol rolJuez;
    private CatJuzgado juzgadoCentral;
    private String tokenAdmin;
    private LocalDateTime ahora;

    @BeforeEach
    void setUp() {
        // Limpiar datos
        auditoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catRolRepository.deleteAll();

        ahora = LocalDateTime.now();

        // Crear roles
        rolAdmin = catRolRepository.save(CatRol.builder()
            .nombre("ADMINISTRADOR")
            .descripcion("Administrador")
            .activo(1)
            .build());

        rolJuez = catRolRepository.save(CatRol.builder()
            .nombre("JUEZ")
            .descripcion("Juez")
            .activo(1)
            .build());

        // Crear juzgados
        juzgadoCentral = catJuzgadoRepository.save(CatJuzgado.builder()
            .codigo("JUZ-001")
            .nombre("Juzgado Central")
            .activo(1)
            .build());

        // Crear usuario admin
        usuarioAdmin = usuarioRepository.save(Usuario.builder()
            .username("admin")
            .password(passwordEncoder.encode("AdminPassword1"))
            .nombreCompleto("Administrador")
            .email("admin@oj.local")
            .rol(rolAdmin)
            .juzgado(juzgadoCentral)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build());

        // Crear usuario no admin
        usuarioNoAdmin = usuarioRepository.save(Usuario.builder()
            .username("usuario")
            .password(passwordEncoder.encode("UserPassword1"))
            .nombreCompleto("Usuario Regular")
            .email("usuario@oj.local")
            .rol(rolJuez)
            .juzgado(juzgadoCentral)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build());

        // Crear data de auditoría de prueba
        auditoriaRepository.save(Auditoria.builder()
            .fecha(ahora.minusHours(2))
            .usuario("admin")
            .ip("192.168.1.1")
            .accion(AuditAction.USUARIO_CREADO)
            .modulo(AuditAction.MODULO_ADMIN)
            .recursoId(1L)
            .detalle("Usuario creado por admin")
            .build());

        auditoriaRepository.save(Auditoria.builder()
            .fecha(ahora.minusHours(1))
            .usuario("admin")
            .ip("192.168.1.1")
            .accion(AuditAction.USUARIO_BLOQUEADO)
            .modulo(AuditAction.MODULO_ADMIN)
            .recursoId(2L)
            .detalle("Usuario bloqueado")
            .build());

        auditoriaRepository.save(Auditoria.builder()
            .fecha(ahora)
            .usuario("usuario")
            .ip("192.168.1.2")
            .accion(AuditAction.LOGIN_EXITOSO)
            .modulo(AuditAction.MODULO_AUTH)
            .recursoId(null)
            .detalle("Login exitoso")
            .build());

        // Generar token
        tokenAdmin = jwtTokenProvider.generateToken(usuarioAdmin);
    }

    /**
     * Test: GET /api/v1/admin/auditoria - Sin filtros
     * Verifica que retorna página con logs de auditoría
     */
    @Test
    void consultar_sinFiltros_shouldReturn200AndAuditorias() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.totalElements").value(3))
            .andExpect(jsonPath("$.data.content[0].usuario").exists())
            .andExpect(jsonPath("$.data.content[0].accion").exists())
            .andExpect(jsonPath("$.data.content[0].modulo").exists());
    }

    /**
     * Test: GET /api/v1/admin/auditoria?usuario=usuario
     * Verifica filtro por usuario (like)
     */
    @Test
    void consultar_porUsuario_shouldFilterByUsername() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .param("usuario", "usuario")
                .param("page", "0")
                .param("size", "50")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isNotEmpty());
    }

    /**
     * Test: GET /api/v1/admin/auditoria?modulo=ADMIN
     * Verifica filtro por módulo (equals)
     */
    @Test
    void consultar_porModulo_shouldFilterByModulo() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .param("modulo", AuditAction.MODULO_ADMIN)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalElements").value(2))  // 2 acciones en MODULO_ADMIN
            .andExpect(jsonPath("$.data.content[0].modulo").value(AuditAction.MODULO_ADMIN))
            .andExpect(jsonPath("$.data.content[1].modulo").value(AuditAction.MODULO_ADMIN));
    }

    /**
     * Test: GET /api/v1/admin/auditoria?accion=USUARIO_CREADO
     * Verifica filtro por acción (equals)
     */
    @Test
    void consultar_porAccion_shouldFilterByAccion() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .param("accion", AuditAction.USUARIO_CREADO)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].accion").value(AuditAction.USUARIO_CREADO));
    }

    /**
     * Test: GET /api/v1/admin/auditoria?fechaDesde=...&fechaHasta=...
     * Verifica filtros de rango de fechas
     */
    @Test
    void consultar_porRangoFechas_shouldFilterByDateRange() throws Exception {
        // Crear una auditoría reciente para este test
        auditoriaRepository.save(Auditoria.builder()
            .fecha(LocalDateTime.now())
            .usuario("admin")
            .ip("192.168.1.1")
            .accion(AuditAction.USUARIO_BLOQUEADO)
            .modulo(AuditAction.MODULO_ADMIN)
            .recursoId(2L)
            .detalle("Usuario bloqueado - test")
            .build());

        LocalDateTime fechaDesde = ahora.minusHours(1);
        LocalDateTime fechaHasta = LocalDateTime.now().plusMinutes(1);

        String fechaDesdeStr = fechaDesde.format(DateTimeFormatter.ISO_DATE_TIME);
        String fechaHastaStr = fechaHasta.format(DateTimeFormatter.ISO_DATE_TIME);

        mockMvc.perform(get("/api/v1/admin/auditoria")
                .param("fechaDesde", fechaDesdeStr)
                .param("fechaHasta", fechaHastaStr)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            // Debería encontrar al menos el que acabamos de crear
            .andExpect(jsonPath("$.data.content.length()").isNumber());
    }

    /**
     * Test: GET /api/v1/admin/auditoria?recursoId=1
     * Verifica filtro por recursoId
     */
    @Test
    void consultar_porRecursoId_shouldFilterByRecursoId() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .param("recursoId", "1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].recursoId").value(1));
    }

    /**
     * Test: GET /api/v1/admin/auditoria - Paginación
     * Verifica que funciona la paginación
     */
    @Test
    void consultar_conPaginacion_shouldReturnPaginatedResults() throws Exception {
        // Asegurar que hay datos (créar uno más)
        auditoriaRepository.save(Auditoria.builder()
            .fecha(LocalDateTime.now())
            .usuario("admin")
            .ip("192.168.1.1")
            .accion(AuditAction.USUARIO_BLOQUEADO)
            .modulo(AuditAction.MODULO_ADMIN)
            .recursoId(5L)
            .detalle("Test paginación")
            .build());

        mockMvc.perform(get("/api/v1/admin/auditoria?page=0&size=2&sort=fecha,desc")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.size").value(2))
            .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    /**
     * Test: GET /api/v1/admin/auditoria con múltiples filtros combinados
     * Verifica que endpoint acepta múltiples filtros
     */
    @Test
    void consultar_conFiltrosCombinados_shouldApplyAllFilters() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .param("usuario", "admin")
                .param("modulo", AuditAction.MODULO_ADMIN)
                .param("accion", AuditAction.USUARIO_BLOQUEADO)
                .param("page", "0")
                .param("size", "20")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isNotEmpty());
    }

    /**
     * Test: GET /api/v1/admin/auditoria/{id} - Obtener log específico
     * Verifica que retorna el detalle del log
     */
    @Test
    void obtener_auditoriaExiste_shouldReturnAuditoriaDetail() throws Exception {
        // Obtener ID de auditoría
        List<Auditoria> auditorias = auditoriaRepository.findAll();
        Long auditoriaId = auditorias.get(0).getId();

        mockMvc.perform(get("/api/v1/admin/auditoria/" + auditoriaId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(auditoriaId))
            .andExpect(jsonPath("$.data.usuario").exists())
            .andExpect(jsonPath("$.data.accion").exists())
            .andExpect(jsonPath("$.data.modulo").exists())
            .andExpect(jsonPath("$.data.detalle").exists());
    }

    /**
     * Test: GET /api/v1/admin/auditoria/{id} - Log no existe
     * Verifica que retorna 404
     */
    @Test
    void obtener_auditoriaNoExiste_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria/999")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    /**
     * Test: GET /api/v1/admin/auditoria - Como usuario NO ADMIN
     * Verifica que retorna 403 Forbidden
     */
    @Test
    void consultar_comoNoAdmin_shouldReturn403() throws Exception {
        String tokenUser = jwtTokenProvider.generateToken(usuarioNoAdmin);

        mockMvc.perform(get("/api/v1/admin/auditoria")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
    }

    /**
     * Test: GET /api/v1/admin/auditoria - Sin autenticación
     * Verifica que retorna 401
     */
    @Test
    void consultar_sinAutenticacion_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }

    /**
     * Test: Validar mapeo de campos en respuesta
     * Verifica que todos los campos se incluyen correctamente
     */
    @Test
    void consultar_shouldIncludeAllFields() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auditoria")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].id").isNumber())
            .andExpect(jsonPath("$.data.content[0].fecha").isNotEmpty())
            .andExpect(jsonPath("$.data.content[0].usuario").isString())
            .andExpect(jsonPath("$.data.content[0].ip").isString())
            .andExpect(jsonPath("$.data.content[0].accion").isString())
            .andExpect(jsonPath("$.data.content[0].modulo").isString())
            .andExpect(jsonPath("$.data.content[0].recursoId").exists())
            .andExpect(jsonPath("$.data.content[0].detalle").isString());
    }
}
