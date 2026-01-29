package com.oj.sged.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.oj.sged.api.dto.request.BusquedaAvanzadaRequest;
import com.oj.sged.api.dto.response.ExpedienteBusquedaResponse;
import com.oj.sged.infrastructure.integration.sgt.SgtExpedienteDto;
import com.oj.sged.infrastructure.integration.sgt.Sgtv1Client;
import com.oj.sged.infrastructure.integration.sgt.Sgtv2Client;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.CatEstado;
import com.oj.sged.infrastructure.persistence.expediente.CatTipoProceso;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.shared.exception.InvalidReferenceException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class BusquedaExpedientesServiceTest {

    @Mock
    private ExpedienteRepository expedienteRepository;
    @Mock
    private CatTipoProcesoRepository catTipoProcesoRepository;
    @Mock
    private CatEstadoRepository catEstadoRepository;
    @Mock
    private CatJuzgadoRepository catJuzgadoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private Sgtv2Client sgtv2Client;
    @Mock
    private Sgtv1Client sgtv1Client;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private BusquedaExpedientesService busquedaService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void buscarRapida_soloSged_priorizaSged() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L, "JZ-010");
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));

        Expediente exp = buildExpediente(1L, "EXP-001", 10L);
        Page<Expediente> sgedPage = new PageImpl<>(List.of(exp), PageRequest.of(0, 10), 1);
        when(expedienteRepository.findByNumeroContainingIgnoreCase(eq("EXP-001"), any(Pageable.class)))
            .thenReturn(sgedPage);
        stubCatalogs(List.of(exp));
        when(sgtv2Client.buscarRapida(eq("EXP-001"), any(Pageable.class))).thenReturn(List.of());
        when(sgtv1Client.buscarRapida(eq("EXP-001"), any(Pageable.class))).thenReturn(List.of());

        Page<ExpedienteBusquedaResponse> response =
            busquedaService.buscarRapida("EXP-001", PageRequest.of(0, 10), "10.0.0.1");

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getFuente()).isEqualTo("SGED");
    }

    @Test
    void buscarRapida_deduplica_priorizaSged_sobreSgtv2() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L, "JZ-010");
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));

        Expediente exp = buildExpediente(1L, "EXP-002", 10L);
        Page<Expediente> sgedPage = new PageImpl<>(List.of(exp), PageRequest.of(0, 10), 1);
        when(expedienteRepository.findByNumeroContainingIgnoreCase(eq("EXP-002"), any(Pageable.class)))
            .thenReturn(sgedPage);
        stubCatalogs(List.of(exp));

        SgtExpedienteDto sgtv2Duplicate = SgtExpedienteDto.builder()
            .numero("EXP-002")
            .juzgadoCodigo("JZ-010")
            .build();
        SgtExpedienteDto sgtv2Other = SgtExpedienteDto.builder()
            .numero("EXP-003")
            .juzgadoCodigo("JZ-010")
            .build();
        when(sgtv2Client.buscarRapida(eq("EXP-002"), any(Pageable.class)))
            .thenReturn(List.of(sgtv2Duplicate, sgtv2Other));

        Page<ExpedienteBusquedaResponse> response =
            busquedaService.buscarRapida("EXP-002", PageRequest.of(0, 10), "10.0.0.2");

        assertThat(response.getContent()).hasSize(2);
        assertThat(response.getContent().get(0).getNumero()).isEqualTo("EXP-002");
        assertThat(response.getContent().get(0).getFuente()).isEqualTo("SGED");
        assertThat(response.getContent().get(1).getFuente()).isEqualTo("SGTV2");
        verify(sgtv1Client, never()).buscarRapida(any(), any());
    }

    @Test
    void buscarRapida_sinSged_usaSgtv2_y_omiteSgtv1() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Usuario usuario = buildUsuario("admin", 10L, "JZ-010");
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));

        Page<Expediente> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
        when(expedienteRepository.findByNumeroContainingIgnoreCase(eq("EXP-004"), any(Pageable.class)))
            .thenReturn(emptyPage);

        SgtExpedienteDto sgtv2Item = SgtExpedienteDto.builder()
            .numero("EXP-004")
            .juzgadoCodigo("JZ-010")
            .build();
        when(sgtv2Client.buscarRapida(eq("EXP-004"), any(Pageable.class))).thenReturn(List.of(sgtv2Item));

        Page<ExpedienteBusquedaResponse> response =
            busquedaService.buscarRapida("EXP-004", PageRequest.of(0, 10), "10.0.0.3");

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getFuente()).isEqualTo("SGTV2");
        verify(sgtv1Client, never()).buscarRapida(any(), any());
    }

    @Test
    void buscarRapida_filtraPorJuzgado_noAdmin() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 10L, "JZ-010");
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));

        Page<Expediente> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
        when(expedienteRepository.findByNumeroContainingIgnoreCaseAndJuzgadoId(eq("EXP-005"), eq(10L), any(Pageable.class)))
            .thenReturn(emptyPage);

        SgtExpedienteDto inJuzgado = SgtExpedienteDto.builder()
            .numero("EXP-005")
            .juzgadoId(10L)
            .juzgadoCodigo("JZ-010")
            .build();
        SgtExpedienteDto otherJuzgado = SgtExpedienteDto.builder()
            .numero("EXP-006")
            .juzgadoId(99L)
            .build();
        when(sgtv2Client.buscarRapida(eq("EXP-005"), any(Pageable.class)))
            .thenReturn(List.of(inJuzgado, otherJuzgado));

        Page<ExpedienteBusquedaResponse> response =
            busquedaService.buscarRapida("EXP-005", PageRequest.of(0, 10), "10.0.0.4");

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getNumero()).isEqualTo("EXP-005");
    }

    @Test
    void buscarRapida_numeroRequerido() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");

        assertThrows(InvalidReferenceException.class,
            () -> busquedaService.buscarRapida("   ", PageRequest.of(0, 10), "10.0.0.5"));
    }

    @Test
    void buscarAvanzada_llamaRepositorio_y_audita() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 20L, "JZ-020");
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));

        BusquedaAvanzadaRequest filtros = new BusquedaAvanzadaRequest();
        filtros.setNumero("EXP-100");
        filtros.setFechaDesde(LocalDate.now().minusDays(10));
        filtros.setFechaHasta(LocalDate.now());
        filtros.setTipoProcesoId(1L);
        filtros.setEstadoId(2L);
        filtros.setJuzgadoId(999L);

        Page<Expediente> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
        when(expedienteRepository.buscarAvanzada(
            any(), any(), any(), any(), any(), eq(20L), any(Pageable.class)
        )).thenReturn(emptyPage);
        when(sgtv2Client.buscarAvanzada(eq(filtros), any(Pageable.class))).thenReturn(List.of());
        when(sgtv1Client.buscarAvanzada(eq(filtros), any(Pageable.class))).thenReturn(List.of());

        Page<ExpedienteBusquedaResponse> response =
            busquedaService.buscarAvanzada(filtros, PageRequest.of(0, 10), "10.0.0.6");

        assertThat(response.getTotalElements()).isZero();
        ArgumentCaptor<String> detalleCaptor = ArgumentCaptor.forClass(String.class);
        verify(auditoriaService).registrar(eq("BUSQUEDA_AVANZADA"), eq("EXPEDIENTE"), eq(null),
            detalleCaptor.capture(), eq("10.0.0.6"));
        assertThat(detalleCaptor.getValue()).contains("numero=EXP-100");
        assertThat(detalleCaptor.getValue()).contains("resultados=0");
    }

    private void stubCatalogs(List<Expediente> expedientes) {
        when(catTipoProcesoRepository.findAllById(any()))
            .thenReturn(List.of(CatTipoProceso.builder().id(1L).nombre("Civil").activo(1).build()));
        when(catEstadoRepository.findAllById(any()))
            .thenReturn(List.of(CatEstado.builder().id(1L).nombre("Activo").activo(1).build()));
        when(catJuzgadoRepository.findAllById(any()))
            .thenReturn(List.of(CatJuzgado.builder().id(expedientes.get(0).getJuzgadoId()).nombre("Juzgado").build()));
    }

    private Expediente buildExpediente(Long id, String numero, Long juzgadoId) {
        return Expediente.builder()
            .id(id)
            .numero(numero)
            .juzgadoId(juzgadoId)
            .tipoProcesoId(1L)
            .estadoId(1L)
            .fechaInicio(LocalDate.now())
            .fechaCreacion(LocalDateTime.now())
            .build();
    }

    private Usuario buildUsuario(String username, Long juzgadoId, String juzgadoCodigo) {
        CatRol rol = CatRol.builder()
            .id(1L)
            .nombre("SECRETARIO")
            .activo(1)
            .build();
        CatJuzgado juzgado = CatJuzgado.builder()
            .id(juzgadoId)
            .codigo(juzgadoCodigo)
            .nombre("Juzgado " + juzgadoId)
            .activo(1)
            .build();
        return Usuario.builder()
            .id(100L)
            .username(username)
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build();
    }

    private void setAuthentication(String username, String role) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            username, null, List.of(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
