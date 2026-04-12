package com.oj.sged.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.oj.sged.api.dto.request.ExpedienteRequest;
import com.oj.sged.api.dto.response.ExpedienteResponse;
import com.oj.sged.application.mapper.ExpedienteMapper;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.shared.exception.InvalidReferenceException;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class ExpedienteServiceTest {

    @Mock
    private ExpedienteRepository expedienteRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CatTipoProcesoRepository catTipoProcesoRepository;
    @Mock
    private CatEstadoRepository catEstadoRepository;
    @Mock
    private ExpedienteMapper expedienteMapper;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private ExpedienteService expedienteService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void crearExpediente_admin_persistsAndAudits() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(catTipoProcesoRepository.existsById(1L)).thenReturn(true);
        when(catEstadoRepository.existsById(1L)).thenReturn(true);

        ExpedienteRequest request = buildRequest(10L);
        Expediente entity = buildExpediente(10L);
        Expediente saved = buildExpediente(10L);
        saved.setId(100L);
        when(expedienteMapper.toEntity(request)).thenReturn(entity);
        when(expedienteRepository.save(entity)).thenReturn(saved);
        when(expedienteMapper.toResponse(saved)).thenReturn(buildResponse(100L, 10L));

        ExpedienteResponse response = expedienteService.crearExpediente(request, "10.0.0.1");

        assertEquals(100L, response.getId());
        verify(expedienteRepository).save(entity);
        verify(auditoriaService).registrar(
            eq("CREAR_EXPEDIENTE"), eq("EXPEDIENTE"), eq(100L),
            eq("Creación de expediente"), eq("10.0.0.1"), eq("admin")
        );
    }

    @Test
    void crearExpediente_secretario_usesOwnJuzgado() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 20L);
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));
        when(catTipoProcesoRepository.existsById(1L)).thenReturn(true);
        when(catEstadoRepository.existsById(1L)).thenReturn(true);

        ExpedienteRequest request = buildRequest(20L);
        Expediente entity = buildExpediente(20L);
        when(expedienteMapper.toEntity(request)).thenReturn(entity);
        when(expedienteRepository.save(entity)).thenReturn(entity);
        when(expedienteMapper.toResponse(entity)).thenReturn(buildResponse(200L, 20L));

        expedienteService.crearExpediente(request, "10.0.0.2");

        assertEquals(20L, request.getJuzgadoId());
        verify(expedienteRepository).save(entity);
    }

    @Test
    void crearExpediente_secretario_differentJuzgado_forbidden() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 20L);
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));

        ExpedienteRequest request = buildRequest(99L);

        assertThrows(AccessDeniedException.class,
            () -> expedienteService.crearExpediente(request, "10.0.0.3"));
        verify(expedienteRepository, never()).save(any());
    }

    @Test
    void crearExpediente_invalidCatalog_throwsDomainException() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(catTipoProcesoRepository.existsById(1L)).thenReturn(false);
        when(catEstadoRepository.existsById(1L)).thenReturn(false);

        ExpedienteRequest request = buildRequest(10L);
        assertThrows(InvalidReferenceException.class,
            () -> expedienteService.crearExpediente(request, "10.0.0.4"));
        verify(expedienteRepository, never()).save(any());
    }

    @Test
    void listarExpedientes_admin_usesFindAll() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Pageable pageable = PageRequest.of(0, 10);
        Page<Expediente> page = new PageImpl<>(List.of(buildExpediente(10L), buildExpediente(20L)));
        when(expedienteRepository.findAll(pageable)).thenReturn(page);
        when(expedienteMapper.toResponse(any(Expediente.class))).thenReturn(buildResponse(1L, 10L));

        expedienteService.listarExpedientes(pageable);

        verify(expedienteRepository).findAll(pageable);
    }

    @Test
    void listarExpedientes_secretario_filtersByJuzgado() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 30L);
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));

        Pageable pageable = PageRequest.of(0, 10);
        Page<Expediente> page = new PageImpl<>(List.of(buildExpediente(30L)));
        when(expedienteRepository.findByJuzgadoId(30L, pageable)).thenReturn(page);
        when(expedienteMapper.toResponse(any(Expediente.class))).thenReturn(buildResponse(1L, 30L));

        expedienteService.listarExpedientes(pageable);

        verify(expedienteRepository).findByJuzgadoId(30L, pageable);
    }

    @Test
    void detalleExpediente_admin_audits() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Expediente expediente = buildExpediente(40L);
        expediente.setId(400L);
        when(expedienteRepository.findById(400L)).thenReturn(Optional.of(expediente));
        when(expedienteMapper.toResponse(expediente)).thenReturn(buildResponse(400L, 40L));

        expedienteService.obtenerDetalleExpediente(400L, "10.0.0.5");

        verify(auditoriaService).registrar(
            eq("VER_EXPEDIENTE"), eq("EXPEDIENTE"), eq(400L),
            eq("Detalle de expediente"), eq("10.0.0.5"), eq("admin")
        );
    }

    @Test
    void detalleExpediente_otherJuzgado_forbidden() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 50L);
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));

        Expediente expediente = buildExpediente(99L);
        expediente.setId(500L);
        when(expedienteRepository.findById(500L)).thenReturn(Optional.of(expediente));

        assertThrows(AccessDeniedException.class,
            () -> expedienteService.obtenerDetalleExpediente(500L, "10.0.0.6"));
        verify(auditoriaService, never()).registrar(any(), any(), any(), any(), any(), any());
    }

    @Test
    void editarExpediente_admin_updatesAndAudits() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(catTipoProcesoRepository.existsById(1L)).thenReturn(true);
        when(catEstadoRepository.existsById(1L)).thenReturn(true);

        Expediente expediente = buildExpediente(10L);
        expediente.setId(600L);
        when(expedienteRepository.findById(600L)).thenReturn(Optional.of(expediente));
        when(expedienteRepository.save(expediente)).thenReturn(expediente);
        when(expedienteMapper.toResponse(expediente)).thenReturn(buildResponse(600L, 10L));

        ExpedienteRequest request = buildRequest(10L);
        expedienteService.editarExpediente(600L, request, "10.0.0.7");

        verify(expedienteMapper).updateEntity(eq(request), eq(expediente));
        verify(auditoriaService).registrar(
            eq("EDITAR_EXPEDIENTE"), eq("EXPEDIENTE"), eq(600L),
            eq("Actualización de expediente"), eq("10.0.0.7"), eq("admin")
        );
    }

    @Test
    void editarExpediente_numero_isImmutable() {
        // Requisito: número de expediente no editable (se ignora el cambio).
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(catTipoProcesoRepository.existsById(1L)).thenReturn(true);
        when(catEstadoRepository.existsById(1L)).thenReturn(true);

        Expediente expediente = buildExpediente(10L);
        expediente.setId(900L);
        expediente.setNumero("EXP-123");
        when(expedienteRepository.findById(900L)).thenReturn(Optional.of(expediente));
        when(expedienteRepository.save(any(Expediente.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expedienteMapper.toResponse(expediente)).thenReturn(buildResponse(900L, 10L));

        ExpedienteRequest request = buildRequest(10L);
        request.setNumero("CAMBIO-999");
        expedienteService.editarExpediente(900L, request, "10.0.0.10");

        ArgumentCaptor<Expediente> captor = ArgumentCaptor.forClass(Expediente.class);
        verify(expedienteRepository).save(captor.capture());
        assertEquals("EXP-123", captor.getValue().getNumero());
    }

    @Test
    void editarExpediente_secretario_otherJuzgado_forbidden() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 70L);
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));

        Expediente expediente = buildExpediente(80L);
        expediente.setId(700L);
        when(expedienteRepository.findById(700L)).thenReturn(Optional.of(expediente));

        ExpedienteRequest request = buildRequest(90L);
        assertThrows(AccessDeniedException.class,
            () -> expedienteService.editarExpediente(700L, request, "10.0.0.8"));
        verify(expedienteRepository, never()).save(any());
    }

    @Test
    void editarExpediente_invalidCatalog_throwsDomainException() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(catTipoProcesoRepository.existsById(1L)).thenReturn(true);
        when(catEstadoRepository.existsById(1L)).thenReturn(false);

        Expediente expediente = buildExpediente(10L);
        expediente.setId(800L);
        when(expedienteRepository.findById(800L)).thenReturn(Optional.of(expediente));

        ExpedienteRequest request = buildRequest(10L);
        assertThrows(InvalidReferenceException.class,
            () -> expedienteService.editarExpediente(800L, request, "10.0.0.9"));
        verify(expedienteRepository, never()).save(any());
    }

    private ExpedienteRequest buildRequest(Long juzgadoId) {
        ExpedienteRequest request = new ExpedienteRequest();
        request.setNumero("EXP-2026-0001");
        request.setTipoProcesoId(1L);
        request.setJuzgadoId(juzgadoId);
        request.setEstadoId(1L);
        request.setFechaInicio(LocalDate.now());
        request.setDescripcion("Expediente de prueba");
        request.setObservaciones("Observaciones");
        request.setReferenciaSgt("SGT-001");
        request.setReferenciaFuente("SGTV2");
        return request;
    }

    private Expediente buildExpediente(Long juzgadoId) {
        return Objects.requireNonNull(Expediente.builder()
            .numero("EXP-2026-0001")
            .tipoProcesoId(1L)
            .juzgadoId(juzgadoId)
            .estadoId(1L)
            .fechaInicio(LocalDate.now())
            .descripcion("Expediente de prueba")
            .observaciones("Observaciones")
            .referenciaSgt("SGT-001")
            .referenciaFuente("SGTV2")
            .usuarioCreacion("sistema")
            .fechaCreacion(LocalDateTime.now())
            .build());
    }

    private ExpedienteResponse buildResponse(Long id, Long juzgadoId) {
        return Objects.requireNonNull(ExpedienteResponse.builder()
            .id(id)
            .numero("EXP-2026-0001")
            .tipoProcesoId(1L)
            .juzgadoId(juzgadoId)
            .estadoId(1L)
            .fechaInicio(LocalDate.now())
            .descripcion("Expediente de prueba")
            .build());
    }

    private Usuario buildUsuario(String username, Long juzgadoId) {
        CatRol rol = Objects.requireNonNull(CatRol.builder()
            .id(1L)
            .nombre("ADMINISTRADOR")
            .activo(1)
            .build());
        CatJuzgado juzgado = Objects.requireNonNull(CatJuzgado.builder()
            .id(juzgadoId)
            .codigo("JZ-" + juzgadoId)
            .nombre("Juzgado " + juzgadoId)
            .activo(1)
            .build());
        return Objects.requireNonNull(Usuario.builder()
            .id(100L)
            .username(username)
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build());
    }

    private void setAuthentication(String username, String role) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            username, null, List.of(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
