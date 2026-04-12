package com.oj.sged.application.service;

import com.oj.sged.api.dto.request.ActualizarUsuarioRequest;
import com.oj.sged.api.dto.request.CrearUsuarioRequest;
import com.oj.sged.api.dto.response.UsuarioAdminResponse;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import com.oj.sged.shared.util.AuditAction;
import java.time.LocalDateTime;
import java.util.Objects;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitarios para AdminUsuarioService (HU-016 y HU-017).
 * Cubre casos de creación, actualización, bloqueo/desbloqueo y reset de contraseña.
 */
@ExtendWith(MockitoExtension.class)
class AdminUsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CatRolRepository rolRepository;
    @Mock
    private CatJuzgadoRepository juzgadoRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private AdminUsuarioService adminUsuarioService;

    private CatRol rolAdmin;
    private CatJuzgado juzgadoCentral;
    private Usuario usuarioExistente;

    @BeforeEach
    void setUp() {
        rolAdmin = Objects.requireNonNull(CatRol.builder()
            .id(1L)
            .nombre("ADMINISTRADOR")
            .descripcion("Administrador del sistema")
            .activo(1)
            .build());

        juzgadoCentral = Objects.requireNonNull(CatJuzgado.builder()
            .id(10L)
            .nombre("Juzgado Central")
            .codigo("JUZ-001")
            .activo(1)
            .build());

        usuarioExistente = Objects.requireNonNull(Usuario.builder()
            .id(100L)
            .username("usuario.test")
            .password("$2a$10$hashedPassword")
            .nombreCompleto("Usuario Test")
            .email("usuario@oj.local")
            .rol(rolAdmin)
            .juzgado(juzgadoCentral)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build());
    }

    /**
     * Test: Crear usuario exitosamente
     * Verifica que se crea con contraseña encriptada, debeCambiarPass=1 y auditoría
     */
    @Test
    void crearUsuario_exitoso_shouldCreateUserAndAudit() {
        // Arrange
        CrearUsuarioRequest request = CrearUsuarioRequest.builder()
            .username("nuevo.usuario")
            .nombreCompleto("Nuevo Usuario")
            .email("nuevo@oj.local")
            .rolId(1L)
            .juzgadoId(10L)
            .build();

        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolAdmin));
        when(juzgadoRepository.findById(10L)).thenReturn(Optional.of(juzgadoCentral));
        when(usuarioRepository.findByUsername("nuevo.usuario")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(String.class))).thenReturn("$2a$10$encodedPassword");

        Usuario usuarioGuardado = Objects.requireNonNull(Usuario.builder()
            .id(101L)
            .username("nuevo.usuario")
            .password("$2a$10$encodedPassword")
            .nombreCompleto("Nuevo Usuario")
            .email("nuevo@oj.local")
            .rol(rolAdmin)
            .juzgado(juzgadoCentral)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(1)
            .fechaCreacion(LocalDateTime.now())
            .build());

        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        // Act
        UsuarioAdminResponse resultado = adminUsuarioService.crearUsuario(request);

        // Assert
        assertNotNull(resultado);
        assertEquals("nuevo.usuario", resultado.getUsername());
        assertEquals("Nuevo Usuario", resultado.getNombreCompleto());
        assertEquals("nuevo@oj.local", resultado.getEmail());
        assertEquals("ADMINISTRADOR", resultado.getRol());
        assertEquals("Juzgado Central", resultado.getJuzgado());
        assertTrue(resultado.getDebeCambiarPassword());

        // Verificar que se pasó contraseña encriptada al save
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioCapturado = usuarioCaptor.getValue();
        assertEquals("$2a$10$encodedPassword", usuarioCapturado.getPassword());
        assertEquals(1, usuarioCapturado.getDebeCambiarPass());

        // Verificar auditoría
        ArgumentCaptor<String> accionCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> moduloCaptor = ArgumentCaptor.forClass(String.class);
        verify(auditoriaService).registrar(
            accionCaptor.capture(),
            moduloCaptor.capture(),
            eq(101L),
            any(String.class),
            any(String.class)
        );
        assertEquals(AuditAction.USUARIO_CREADO, accionCaptor.getValue());
        assertEquals(AuditAction.MODULO_ADMIN, moduloCaptor.getValue());
    }

    /**
     * Test: Crear usuario con rol inexistente
     * Verifica que lanza ResourceNotFoundException
     */
    @Test
    void crearUsuario_rolNoExiste_shouldThrowException() {
        // Arrange
        CrearUsuarioRequest request = CrearUsuarioRequest.builder()
            .username("nuevo.usuario")
            .nombreCompleto("Nuevo Usuario")
            .email("nuevo@oj.local")
            .rolId(999L)
            .juzgadoId(10L)
            .build();

        when(rolRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            adminUsuarioService.crearUsuario(request);
        });

        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(auditoriaService, never()).registrar(any(), any(), any(), any(), any());
    }

    /**
     * Test: Crear usuario con username duplicado
     * Verifica que lanza ResourceNotFoundException
     */
    @Test
    void crearUsuario_usernameDuplicado_shouldThrowException() {
        // Arrange
        CrearUsuarioRequest request = CrearUsuarioRequest.builder()
            .username("usuario.test")
            .nombreCompleto("Usuario Duplicado")
            .email("duplicado@oj.local")
            .rolId(1L)
            .juzgadoId(10L)
            .build();

        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolAdmin));
        when(juzgadoRepository.findById(10L)).thenReturn(Optional.of(juzgadoCentral));
        when(usuarioRepository.findByUsername("usuario.test")).thenReturn(Optional.of(usuarioExistente));

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            adminUsuarioService.crearUsuario(request);
        });

        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(auditoriaService, never()).registrar(any(), any(), any(), any(), any());
    }

    /**
     * Test: Actualizar usuario con cambio de rol y juzgado
     * Verifica que se persisten cambios y se registra auditoría
     */
    @Test
    void actualizarUsuario_cambiaRolYJuzgado_shouldUpdateAndAudit() {
        // Arrange
        CatRol rolJuez = Objects.requireNonNull(CatRol.builder()
            .id(2L)
            .nombre("JUEZ")
            .descripcion("Juez")
            .activo(1)
            .build());

        CatJuzgado juzgadoSegundo = Objects.requireNonNull(CatJuzgado.builder()
            .id(11L)
            .nombre("Juzgado Segundo")
            .codigo("JUZ-002")
            .activo(1)
            .build());

        ActualizarUsuarioRequest request = ActualizarUsuarioRequest.builder()
            .nombreCompleto("Usuario Actualizado")
            .email("actualizado@oj.local")
            .rolId(2L)
            .juzgadoId(11L)
            .activo(true)
            .bloqueado(false)
            .build();

        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(usuarioExistente));
        when(rolRepository.findById(2L)).thenReturn(Optional.of(rolJuez));
        when(juzgadoRepository.findById(11L)).thenReturn(Optional.of(juzgadoSegundo));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        UsuarioAdminResponse resultado = adminUsuarioService.actualizarUsuario(100L, request);

        // Assert
        assertNotNull(resultado);
        assertEquals("Usuario Actualizado", resultado.getNombreCompleto());
        assertEquals("actualizado@oj.local", resultado.getEmail());
        assertEquals("JUEZ", resultado.getRol());
        assertEquals("Juzgado Segundo", resultado.getJuzgado());

        // Verificar auditoría
        verify(auditoriaService).registrar(
            eq(AuditAction.USUARIO_ACTUALIZADO),
            eq(AuditAction.MODULO_ADMIN),
            eq(100L),
            any(String.class),
            any(String.class)
        );
    }

    /**
     * Test: Actualizar usuario sin cambios relevantes
     * Verifica que NO se registra auditoría si no hay cambios
     */
    @Test
    void actualizarUsuario_sinCambios_shouldNotAudit() {
        // Arrange
        ActualizarUsuarioRequest request = ActualizarUsuarioRequest.builder()
            .nombreCompleto("Usuario Test")  // Mismo nombre
            .email("usuario@oj.local")       // Mismo email
            .build();

        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        UsuarioAdminResponse resultado = adminUsuarioService.actualizarUsuario(100L, request);

        // Assert
        assertNotNull(resultado);

        // Verificar que NO se llama a auditoría
        verify(auditoriaService, never()).registrar(any(), any(), any(), any(), any());
    }

    /**
     * Test: Resetear contraseña
     * Verifica que se encripta nueva password, debeCambiarPass=1 y auditoría
     */
    @Test
    void resetPassword_admin_shouldChangePasswordAndAudit() {
        // Arrange
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(usuarioExistente));
        when(passwordEncoder.encode(any(String.class))).thenReturn("$2a$10$newEncodedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        adminUsuarioService.resetPassword(100L);

        // Assert
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioCapturado = usuarioCaptor.getValue();
        assertEquals(1, usuarioCapturado.getDebeCambiarPass());
        assertEquals("$2a$10$newEncodedPassword", usuarioCapturado.getPassword());

        // Verificar auditoría
        verify(auditoriaService).registrar(
            eq(AuditAction.RESET_PASSWORD_ADMIN),
            eq(AuditAction.MODULO_ADMIN),
            eq(100L),
            any(String.class),
            any(String.class)
        );
    }

    /**
     * Test: Bloquear usuario
     * Verifica que bloqueado=1 y se registra auditoría
     */
    @Test
    void bloquearUsuario_shouldLockUserAndAudit() {
        // Arrange
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        adminUsuarioService.bloquearUsuario(100L);

        // Assert
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioCapturado = usuarioCaptor.getValue();
        assertEquals(1, usuarioCapturado.getBloqueado());

        // Verificar auditoría
        verify(auditoriaService).registrar(
            eq(AuditAction.USUARIO_BLOQUEADO),
            eq(AuditAction.MODULO_ADMIN),
            eq(100L),
            any(String.class),
            any(String.class)
        );
    }

    /**
     * Test: Desbloquear usuario
     * Verifica que bloqueado=0, fechaBloqueo=null y auditoría
     */
    @Test
    void desbloquearUsuario_shouldUnlockUserAndAudit() {
        // Arrange
        usuarioExistente.setBloqueado(1);
        usuarioExistente.setFechaBloqueo(LocalDateTime.now());

        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        adminUsuarioService.desbloquearUsuario(100L);

        // Assert
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioCapturado = usuarioCaptor.getValue();
        assertEquals(0, usuarioCapturado.getBloqueado());

        // Verificar auditoría
        verify(auditoriaService).registrar(
            eq(AuditAction.USUARIO_DESBLOQUEADO),
            eq(AuditAction.MODULO_ADMIN),
            eq(100L),
            any(String.class),
            any(String.class)
        );
    }

    /**
     * Test: Obtener usuario que no existe
     * Verifica que lanza ResourceNotFoundException
     */
    @Test
    void obtenerUsuario_noExiste_shouldThrowException() {
        // Arrange
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            adminUsuarioService.obtenerUsuario(999L);
        });
    }
}
