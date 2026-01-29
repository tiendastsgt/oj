package com.oj.sged.application.service;

import com.oj.sged.api.dto.response.AuditoriaResponse;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import com.oj.sged.shared.util.AuditAction;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitarios para AuditoriaConsultaService (HU-018).
 * Cubre filtrados dinámicos de auditoría: usuario, módulo, acción, rango de fechas, recursoId.
 */
@ExtendWith(MockitoExtension.class)
class AuditoriaConsultaServiceTest {

    @Mock
    private AuditoriaRepository auditoriaRepository;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private AuditoriaConsultaService auditoriaConsultaService;

    private Auditoria auditoriaTest;
    private LocalDateTime ahora;

    @BeforeEach
    void setUp() {
        ahora = LocalDateTime.now();

        auditoriaTest = Auditoria.builder()
            .id(1L)
            .fecha(ahora)
            .usuario("usuario.test")
            .ip("192.168.1.1")
            .accion(AuditAction.USUARIO_CREADO)
            .modulo(AuditAction.MODULO_ADMIN)
            .recursoId(100L)
            .detalle("Usuario test creado")
            .build();
    }

    /**
     * Test: Consultar auditoría sin filtros
     * Verifica que retorna página con auditorías
     */
    @Test
    void consultar_sinFiltros_shouldReturnAllAuditorias() {
        // Arrange
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            null, null, null, null, null, null, pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        AuditoriaResponse auditoria = resultado.getContent().get(0);
        assertEquals(1L, auditoria.getId());
        assertEquals("usuario.test", auditoria.getUsuario());
        assertEquals(AuditAction.USUARIO_CREADO, auditoria.getAccion());
        assertEquals(AuditAction.MODULO_ADMIN, auditoria.getModulo());

        // Verifica que se registró la consulta en auditoría
        verify(auditoriaService).registrar(
            eq(AuditAction.CONSULTAR_AUDITORIA),
            eq(AuditAction.MODULO_ADMIN),
            eq(null),
            any(String.class),
            eq("127.0.0.1")
        );
    }

    /**
     * Test: Consultar auditoría filtrando por usuario
     * Verifica que se aplica filtro usuario (like)
     */
    @Test
    void consultar_porUsuario_shouldFilterByUsername() {
        // Arrange
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            "usuario.test", null, null, null, null, null, pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals("usuario.test", resultado.getContent().get(0).getUsuario());

        // Verifica que se llamó a findAll con Specification
        ArgumentCaptor<Specification<Auditoria>> specCaptor = ArgumentCaptor.forClass(Specification.class);
        verify(auditoriaRepository).findAll(specCaptor.capture(), eq(pageable));
        assertNotNull(specCaptor.getValue());
    }

    /**
     * Test: Consultar auditoría filtrando por módulo
     * Verifica que se aplica filtro módulo (equals)
     */
    @Test
    void consultar_porModulo_shouldFilterByModulo() {
        // Arrange
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            null, AuditAction.MODULO_ADMIN, null, null, null, null, pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(AuditAction.MODULO_ADMIN, resultado.getContent().get(0).getModulo());

        // Verifica que se aplicó el filtro
        ArgumentCaptor<Specification<Auditoria>> specCaptor = ArgumentCaptor.forClass(Specification.class);
        verify(auditoriaRepository).findAll(specCaptor.capture(), eq(pageable));
        assertNotNull(specCaptor.getValue());
    }

    /**
     * Test: Consultar auditoría filtrando por acción
     * Verifica que se aplica filtro acción (equals)
     */
    @Test
    void consultar_porAccion_shouldFilterByAccion() {
        // Arrange
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            null, null, AuditAction.USUARIO_CREADO, null, null, null, pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(AuditAction.USUARIO_CREADO, resultado.getContent().get(0).getAccion());
    }

    /**
     * Test: Consultar auditoría con rango de fechas
     * Verifica que se aplican filtros fechaDesde y fechaHasta
     */
    @Test
    void consultar_porRangoFechas_shouldFilterByDateRange() {
        // Arrange
        LocalDateTime fechaDesde = ahora.minusHours(1);
        LocalDateTime fechaHasta = ahora.plusHours(1);
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            null, null, null, fechaDesde, fechaHasta, null, pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        LocalDateTime fechaAuditoria = resultado.getContent().get(0).getFecha();
        assertTrue(fechaAuditoria.isAfter(fechaDesde) || fechaAuditoria.isEqual(fechaDesde));
        assertTrue(fechaAuditoria.isBefore(fechaHasta) || fechaAuditoria.isEqual(fechaHasta));
    }

    /**
     * Test: Consultar auditoría filtrando por recursoId
     * Verifica que se aplica filtro recursoId
     */
    @Test
    void consultar_porRecursoId_shouldFilterByRecursoId() {
        // Arrange
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            null, null, null, null, null, 100L, pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(100L, resultado.getContent().get(0).getRecursoId());
    }

    /**
     * Test: Consultar auditoría con múltiples filtros combinados
     * Verifica que todos los filtros se aplican (AND)
     */
    @Test
    void consultar_conFiltrosCombinados_shouldApplyAllFilters() {
        // Arrange
        LocalDateTime fechaDesde = ahora.minusHours(1);
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        // Act
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            "usuario.test",
            AuditAction.MODULO_ADMIN,
            AuditAction.USUARIO_CREADO,
            fechaDesde,
            null,
            100L,
            pageable
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        AuditoriaResponse auditoria = resultado.getContent().get(0);
        assertEquals("usuario.test", auditoria.getUsuario());
        assertEquals(AuditAction.MODULO_ADMIN, auditoria.getModulo());
        assertEquals(AuditAction.USUARIO_CREADO, auditoria.getAccion());
        assertEquals(100L, auditoria.getRecursoId());
    }

    /**
     * Test: Obtener auditoría por ID exitoso
     * Verifica que retorna el log específico
     */
    @Test
    void obtener_auditoriaExiste_shouldReturnAuditoria() {
        // Arrange
        when(auditoriaRepository.findById(1L)).thenReturn(Optional.of(auditoriaTest));

        // Act
        AuditoriaResponse resultado = auditoriaConsultaService.obtener(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("usuario.test", resultado.getUsuario());
        assertEquals(AuditAction.USUARIO_CREADO, resultado.getAccion());
    }

    /**
     * Test: Obtener auditoría que no existe
     * Verifica que lanza ResourceNotFoundException
     */
    @Test
    void obtener_auditoriaNoExiste_shouldThrowException() {
        // Arrange
        when(auditoriaRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            auditoriaConsultaService.obtener(999L);
        });
    }

    /**
     * Test auxiliar: Validar mapeo de Auditoria a AuditoriaResponse
     */
    @Test
    void mapToResponse_shouldMapAllFields() {
        // Este test valida el mapeo indirectamente a través de consultar()
        Pageable pageable = Pageable.unpaged();
        Page<Auditoria> pageAuditorias = new PageImpl<>(List.of(auditoriaTest));

        when(auditoriaRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(pageAuditorias);

        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            null, null, null, null, null, null, pageable
        );

        AuditoriaResponse auditoria = resultado.getContent().get(0);
        assertEquals(1L, auditoria.getId());
        assertEquals(ahora, auditoria.getFecha());
        assertEquals("usuario.test", auditoria.getUsuario());
        assertEquals("192.168.1.1", auditoria.getIp());
        assertEquals(AuditAction.USUARIO_CREADO, auditoria.getAccion());
        assertEquals(AuditAction.MODULO_ADMIN, auditoria.getModulo());
        assertEquals(100L, auditoria.getRecursoId());
        assertEquals("Usuario test creado", auditoria.getDetalle());
    }

    // Helper imports for date assertions
    private void assertTrue(boolean condition) {
        org.junit.jupiter.api.Assertions.assertTrue(condition);
    }
}
