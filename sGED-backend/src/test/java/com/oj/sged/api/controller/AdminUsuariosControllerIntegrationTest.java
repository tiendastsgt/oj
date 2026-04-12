package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.api.dto.request.ActualizarUsuarioRequest;
import com.oj.sged.api.dto.request.CrearUsuarioRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests de integración para AdminUsuariosController (HU-016 y HU-017).
 * Cubre CRUD de usuarios, bloqueo/desbloqueo, RBAC y auditoría en BD.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
class AdminUsuariosControllerIntegrationTest {

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

    @BeforeEach
    void setUp() {
        // Limpiar datos
        auditoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catRolRepository.deleteAll();

        // Crear roles
        rolAdmin = catRolRepository.save(Objects.requireNonNull(CatRol.builder()
            .nombre("ADMINISTRADOR")
            .descripcion("Administrador")
            .activo(1)
            .build()));

        rolJuez = catRolRepository.save(Objects.requireNonNull(CatRol.builder()
            .nombre("JUEZ")
            .descripcion("Juez")
            .activo(1)
            .build()));

        // Crear juzgados
        juzgadoCentral = catJuzgadoRepository.save(Objects.requireNonNull(CatJuzgado.builder()
            .codigo("JUZ-001")
            .nombre("Juzgado Central")
            .activo(1)
            .build()));

        CatJuzgado juzgadoSegundo = catJuzgadoRepository.save(Objects.requireNonNull(CatJuzgado.builder()
            .codigo("JUZ-002")
            .nombre("Juzgado Segundo")
            .activo(1)
            .build()));

        // Crear usuario admin
        usuarioAdmin = usuarioRepository.save(Objects.requireNonNull(Usuario.builder()
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
            .build()));

        // Crear usuario no admin
        usuarioNoAdmin = usuarioRepository.save(Objects.requireNonNull(Usuario.builder()
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
            .build()));

        // Generar token
        tokenAdmin = jwtTokenProvider.generateToken(usuarioAdmin);
    }

    /**
     * Test: GET /api/v1/admin/usuarios - Listar usuarios como ADMIN
     * Verifica que retorna 200 y lista de usuarios
     */
    @Test
    void listarUsuarios_comoAdmin_shouldReturn200AndList() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content.length()").value(2))  // admin y usuario
            .andExpect(jsonPath("$.data.content[0].username").exists());
    }

    /**
     * Test: GET /api/v1/admin/usuarios con filtros
     * Verifica que endpoint acepta filtros
     */
    @Test
    void listarUsuarios_conFiltros_shouldAcceptFilters() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios")
                .param("page", "0")
                .param("size", "10")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray());
    }

    /**
     * Test: GET /api/v1/admin/usuarios - Como usuario NO ADMIN
     * Verifica que retorna 403 Forbidden
     */
    @Test
    void listarUsuarios_comoNoAdmin_shouldReturn403() throws Exception {
        String tokenUser = jwtTokenProvider.generateToken(usuarioNoAdmin);

        mockMvc.perform(get("/api/v1/admin/usuarios")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenUser)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
    }

    /**
     * Test: POST /api/v1/admin/usuarios - Crear usuario exitosamente
     * Verifica que crea usuario en BD y registra auditoría
     */
    @Test
    void crearUsuario_exitoso_shouldCreateAndAudit() throws Exception {
        CrearUsuarioRequest request = CrearUsuarioRequest.builder()
            .username("nuevo.usuario")
            .nombreCompleto("Nuevo Usuario")
            .email("nuevo@oj.local")
            .rolId(rolJuez.getId())
            .juzgadoId(juzgadoCentral.getId())
            .build();

        mockMvc.perform(post("/api/v1/admin/usuarios")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.username").value("nuevo.usuario"))
            .andExpect(jsonPath("$.data.nombreCompleto").value("Nuevo Usuario"))
            .andExpect(jsonPath("$.data.email").value("nuevo@oj.local"))
            .andExpect(jsonPath("$.data.rol").value("JUEZ"))
            .andExpect(jsonPath("$.data.debeCambiarPassword").value(true));

        // Verificar en BD
        Usuario usuarioCreado = usuarioRepository.findByUsername("nuevo.usuario").orElseThrow();
        assertThat(usuarioCreado)
            .isNotNull()
            .hasFieldOrPropertyWithValue("username", "nuevo.usuario")
            .hasFieldOrPropertyWithValue("nombreCompleto", "Nuevo Usuario")
            .hasFieldOrPropertyWithValue("debeCambiarPass", 1);

        // Verificar auditoría en BD
        List<Auditoria> auditorias = auditoriaRepository.findByAccionAndRecursoIdOrderByFechaDesc(
            AuditAction.USUARIO_CREADO,
            usuarioCreado.getId()
        );
        assertThat(auditorias)
            .isNotEmpty()
            .first()
            .hasFieldOrPropertyWithValue("accion", AuditAction.USUARIO_CREADO)
            .hasFieldOrPropertyWithValue("modulo", AuditAction.MODULO_ADMIN);
    }

    /**
     * Test: POST /api/v1/admin/usuarios - Con username duplicado
     * Verifica que retorna error y no crea usuario
     */
    @Test
    void crearUsuario_usernameDuplicado_shouldReturnError() throws Exception {
        CrearUsuarioRequest request = CrearUsuarioRequest.builder()
            .username("admin")  // Ya existe
            .nombreCompleto("Otro Admin")
            .email("otro@oj.local")
            .rolId(rolAdmin.getId())
            .juzgadoId(juzgadoCentral.getId())
            .build();

        // Intentar crear - espera error (400 o similar)
        var response = mockMvc.perform(post("/api/v1/admin/usuarios")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().is4xxClientError())  // Acepta cualquier 4xx
            .andReturn();

        // Verificar que NO se creó un segundo usuario con ese username
        long countAdmin = usuarioRepository.findAll().stream()
            .filter(u -> u.getUsername().equals("admin"))
            .count();
        assertThat(countAdmin).isEqualTo(1);
    }

    /**
     * Test: PUT /api/v1/admin/usuarios/{id} - Actualizar usuario
     * Verifica que persisten cambios en BD
     */
    @Test
    void actualizarUsuario_exitoso_shouldUpdateAndAudit() throws Exception {
        ActualizarUsuarioRequest request = ActualizarUsuarioRequest.builder()
            .nombreCompleto("Usuario Renombrado")
            .email("renombrado@oj.local")
            .rolId(rolAdmin.getId())  // Cambiar a ADMIN
            .activo(true)
            .bloqueado(false)
            .build();

        mockMvc.perform(put("/api/v1/admin/usuarios/" + usuarioNoAdmin.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.nombreCompleto").value("Usuario Renombrado"))
            .andExpect(jsonPath("$.data.email").value("renombrado@oj.local"))
            .andExpect(jsonPath("$.data.rol").value("ADMINISTRADOR"));

        // Verificar en BD - refrescar desde BD para evitar lazy initialization
        Usuario usuarioActualizado = usuarioRepository.findById(Objects.requireNonNull(usuarioNoAdmin.getId())).orElseThrow();
        assertThat(usuarioActualizado)
            .hasFieldOrPropertyWithValue("nombreCompleto", "Usuario Renombrado")
            .hasFieldOrPropertyWithValue("email", "renombrado@oj.local");
        assertThat(usuarioActualizado.getRol().getId()).isEqualTo(rolAdmin.getId());

        // Verificar auditoría
        List<Auditoria> auditorias = auditoriaRepository.findByAccionAndRecursoIdOrderByFechaDesc(
            AuditAction.USUARIO_ACTUALIZADO,
            usuarioNoAdmin.getId()
        );
        assertThat(auditorias).isNotEmpty();
    }

    /**
     * Test: POST /api/v1/admin/usuarios/{id}/bloquear - Bloquear usuario
     * Verifica que bloqueado=1 en BD y auditoría
     */
    @Test
    void bloquearUsuario_exitoso_shouldBlockAndAudit() throws Exception {
        mockMvc.perform(post("/api/v1/admin/usuarios/" + usuarioNoAdmin.getId() + "/bloquear")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        // Verificar en BD
        Usuario usuarioBloqueado = usuarioRepository.findById(Objects.requireNonNull(usuarioNoAdmin.getId())).orElseThrow();
        assertThat(usuarioBloqueado)
            .hasFieldOrPropertyWithValue("bloqueado", 1);

        // Verificar auditoría
        List<Auditoria> auditorias = auditoriaRepository.findByAccionAndRecursoIdOrderByFechaDesc(
            AuditAction.USUARIO_BLOQUEADO,
            usuarioNoAdmin.getId()
        );
        assertThat(auditorias)
            .isNotEmpty()
            .first()
            .hasFieldOrPropertyWithValue("accion", AuditAction.USUARIO_BLOQUEADO)
            .hasFieldOrPropertyWithValue("modulo", AuditAction.MODULO_ADMIN);
    }

    /**
     * Test: POST /api/v1/admin/usuarios/{id}/desbloquear - Desbloquear usuario
     * Verifica que bloqueado=0 en BD y auditoría
     */
    @Test
    void desbloquearUsuario_exitoso_shouldUnblockAndAudit() throws Exception {
        // Primero bloquear
        usuarioNoAdmin.setBloqueado(1);
        usuarioRepository.save(usuarioNoAdmin);

        // Luego desbloquear
        mockMvc.perform(post("/api/v1/admin/usuarios/" + usuarioNoAdmin.getId() + "/desbloquear")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        // Verificar en BD
        Usuario usuarioDesbloqueado = usuarioRepository.findById(Objects.requireNonNull(usuarioNoAdmin.getId())).orElseThrow();
        assertThat(usuarioDesbloqueado)
            .hasFieldOrPropertyWithValue("bloqueado", 0);

        // Verificar auditoría
        List<Auditoria> auditorias = auditoriaRepository.findByAccionAndRecursoIdOrderByFechaDesc(
            AuditAction.USUARIO_DESBLOQUEADO,
            usuarioNoAdmin.getId()
        );
        assertThat(auditorias)
            .isNotEmpty()
            .first()
            .hasFieldOrPropertyWithValue("accion", AuditAction.USUARIO_DESBLOQUEADO);
    }

    /**
     * Test: POST /api/v1/admin/usuarios/{id}/reset-password
     * Verifica que se cambia contraseña y debeCambiarPass=1
     */
    @Test
    void resetPassword_exitoso_shouldResetAndAudit() throws Exception {
        mockMvc.perform(post("/api/v1/admin/usuarios/" + usuarioNoAdmin.getId() + "/reset-password")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        // Verificar en BD
        Usuario usuarioReseteado = usuarioRepository.findById(Objects.requireNonNull(usuarioNoAdmin.getId())).orElseThrow();
        assertThat(usuarioReseteado)
            .hasFieldOrPropertyWithValue("debeCambiarPass", 1);

        // Verificar auditoría
        List<Auditoria> auditorias = auditoriaRepository.findByAccionAndRecursoIdOrderByFechaDesc(
            AuditAction.RESET_PASSWORD_ADMIN,
            usuarioNoAdmin.getId()
        );
        assertThat(auditorias)
            .isNotEmpty()
            .first()
            .hasFieldOrPropertyWithValue("accion", AuditAction.RESET_PASSWORD_ADMIN);
    }

    /**
     * Test: GET /api/v1/admin/usuarios/{id} - Obtener usuario específico
     * Verifica que retorna los datos del usuario
     */
    @Test
    void obtenerUsuario_exitoso_shouldReturnUserData() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios/" + usuarioNoAdmin.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(usuarioNoAdmin.getId()))
            .andExpect(jsonPath("$.data.username").value("usuario"))
            .andExpect(jsonPath("$.data.rol").value("JUEZ"));
    }

    /**
     * Test: GET /api/v1/admin/usuarios/{id} - Usuario no existe
     * Verifica que retorna 404
     */
    @Test
    void obtenerUsuario_noExiste_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios/999")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    /**
     * Test: POST /api/v1/admin/usuarios - Sin autenticación
     * Verifica que retorna 401
     */
    @Test
    void crearUsuario_sinAutenticacion_shouldReturn401() throws Exception {
        CrearUsuarioRequest request = CrearUsuarioRequest.builder()
            .username("nuevo")
            .nombreCompleto("Nuevo")
            .email("nuevo@oj.local")
            .rolId(1L)
            .juzgadoId(1L)
            .build();

        mockMvc.perform(post("/api/v1/admin/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }
}
