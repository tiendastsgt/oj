package com.oj.sged.application.service;

import com.oj.sged.api.dto.request.BusquedaAvanzadaRequest;
import com.oj.sged.api.dto.response.ExpedienteBusquedaResponse;
import com.oj.sged.infrastructure.integration.sgt.SgtExpedienteDto;
import com.oj.sged.infrastructure.integration.sgt.Sgtv1Client;
import com.oj.sged.infrastructure.integration.sgt.Sgtv2Client;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.shared.exception.AuthException;
import com.oj.sged.shared.exception.InvalidReferenceException;
import com.oj.sged.shared.util.SecurityUtil;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusquedaExpedientesService {

    private static final String MODULO = "EXPEDIENTE";
    private final ExpedienteRepository expedienteRepository;
    private final CatTipoProcesoRepository catTipoProcesoRepository;
    private final CatEstadoRepository catEstadoRepository;
    private final CatJuzgadoRepository catJuzgadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final Sgtv2Client sgtv2Client;
    private final Sgtv1Client sgtv1Client;
    private final AuditoriaService auditoriaService;

    public BusquedaExpedientesService(
        ExpedienteRepository expedienteRepository,
        CatTipoProcesoRepository catTipoProcesoRepository,
        CatEstadoRepository catEstadoRepository,
        CatJuzgadoRepository catJuzgadoRepository,
        UsuarioRepository usuarioRepository,
        Sgtv2Client sgtv2Client,
        Sgtv1Client sgtv1Client,
        AuditoriaService auditoriaService
    ) {
        this.expedienteRepository = expedienteRepository;
        this.catTipoProcesoRepository = catTipoProcesoRepository;
        this.catEstadoRepository = catEstadoRepository;
        this.catJuzgadoRepository = catJuzgadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.sgtv2Client = sgtv2Client;
        this.sgtv1Client = sgtv1Client;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public Page<ExpedienteBusquedaResponse> buscarRapida(String numero, Pageable pageable, String ip) {
        String normalized = normalize(numero);
        if (normalized == null) {
            throw new InvalidReferenceException(List.of("El número es requerido"));
        }

        Usuario usuario = getCurrentUser();
        Long juzgadoId = isAdmin() ? null : getUserJuzgadoId(usuario);
        String juzgadoCodigo = usuario.getJuzgado() != null ? usuario.getJuzgado().getCodigo() : null;

        Page<Expediente> sgedPage = (juzgadoId == null)
            ? expedienteRepository.findByNumeroContainingIgnoreCase(normalized, pageable)
            : expedienteRepository.findByNumeroContainingIgnoreCaseAndJuzgadoId(normalized, juzgadoId, pageable);

        List<ExpedienteBusquedaResponse> sged = mapSged(sgedPage.getContent());
        List<ExpedienteBusquedaResponse> sgtv2 = mapSgt(filterSgtByJuzgado(
            sgtv2Client.buscarRapida(normalized, pageable), juzgadoId, juzgadoCodigo
        ), "SGTV2");
        List<ExpedienteBusquedaResponse> sgtv1 = sgtv2.isEmpty()
            ? mapSgt(filterSgtByJuzgado(
                sgtv1Client.buscarRapida(normalized, pageable), juzgadoId, juzgadoCodigo
            ), "SGTV1")
            : List.of();

        Page<ExpedienteBusquedaResponse> page = combineAndPage(sged, sgtv2, sgtv1, pageable);
        auditoriaService.registrar("BUSQUEDA_RAPIDA", MODULO, null,
            "numero=" + normalized + ", resultados=" + page.getTotalElements(), ip);
        return page;
    }

    @Transactional(readOnly = true)
    public Page<ExpedienteBusquedaResponse> buscarAvanzada(
        BusquedaAvanzadaRequest filtros,
        Pageable pageable,
        String ip
    ) {
        Usuario usuario = getCurrentUser();
        Long juzgadoId = isAdmin() ? filtros.getJuzgadoId() : getUserJuzgadoId(usuario);
        String juzgadoCodigo = usuario.getJuzgado() != null ? usuario.getJuzgado().getCodigo() : null;

        String numero = normalize(filtros.getNumero());
        Page<Expediente> sgedPage;
        boolean soloNumero = numero != null
            && filtros.getFechaDesde() == null
            && filtros.getFechaHasta() == null
            && filtros.getTipoProcesoId() == null
            && filtros.getEstadoId() == null;
        if (soloNumero) {
            sgedPage = (juzgadoId == null)
                ? expedienteRepository.findByNumeroContainingIgnoreCase(numero, pageable)
                : expedienteRepository.findByNumeroContainingIgnoreCaseAndJuzgadoId(numero, juzgadoId, pageable);
        } else {
            sgedPage = expedienteRepository.buscarAvanzada(
                numero,
                filtros.getFechaDesde(),
                filtros.getFechaHasta(),
                filtros.getTipoProcesoId(),
                filtros.getEstadoId(),
                juzgadoId,
                pageable
            );
        }

        List<ExpedienteBusquedaResponse> sged = mapSged(sgedPage.getContent());
        List<ExpedienteBusquedaResponse> sgtv2 = mapSgt(filterSgtByJuzgado(
            sgtv2Client.buscarAvanzada(filtros, pageable), juzgadoId, juzgadoCodigo
        ), "SGTV2");
        List<ExpedienteBusquedaResponse> sgtv1 = sgtv2.isEmpty()
            ? mapSgt(filterSgtByJuzgado(
                sgtv1Client.buscarAvanzada(filtros, pageable), juzgadoId, juzgadoCodigo
            ), "SGTV1")
            : List.of();

        Page<ExpedienteBusquedaResponse> page = combineAndPage(sged, sgtv2, sgtv1, pageable);
        if (hasAnyFilter(filtros)) {
            auditoriaService.registrar("BUSQUEDA_AVANZADA", MODULO, null,
                buildDetalle(filtros, page.getTotalElements()), ip);
        }
        return page;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean hasAnyFilter(BusquedaAvanzadaRequest filtros) {
        return normalize(filtros.getNumero()) != null
            || filtros.getFechaDesde() != null
            || filtros.getFechaHasta() != null
            || filtros.getTipoProcesoId() != null
            || filtros.getEstadoId() != null
            || filtros.getJuzgadoId() != null
            || normalize(filtros.getActor()) != null
            || normalize(filtros.getDemandado()) != null
            || normalize(filtros.getReferenciaSgt()) != null;
    }

    private String buildDetalle(BusquedaAvanzadaRequest filtros, long total) {
        List<String> parts = new ArrayList<>();
        if (normalize(filtros.getNumero()) != null) {
            parts.add("numero=" + normalize(filtros.getNumero()));
        }
        if (filtros.getFechaDesde() != null) {
            parts.add("fechaDesde=" + filtros.getFechaDesde());
        }
        if (filtros.getFechaHasta() != null) {
            parts.add("fechaHasta=" + filtros.getFechaHasta());
        }
        if (filtros.getTipoProcesoId() != null) {
            parts.add("tipoProcesoId=" + filtros.getTipoProcesoId());
        }
        if (filtros.getEstadoId() != null) {
            parts.add("estadoId=" + filtros.getEstadoId());
        }
        if (filtros.getJuzgadoId() != null) {
            parts.add("juzgadoId=" + filtros.getJuzgadoId());
        }
        if (normalize(filtros.getActor()) != null) {
            parts.add("actor=" + filtros.getActor());
        }
        if (normalize(filtros.getDemandado()) != null) {
            parts.add("demandado=" + filtros.getDemandado());
        }
        if (normalize(filtros.getReferenciaSgt()) != null) {
            parts.add("referenciaSgt=" + filtros.getReferenciaSgt());
        }
        parts.add("resultados=" + total);
        return String.join(", ", parts);
    }

    private Page<ExpedienteBusquedaResponse> combineAndPage(
        List<ExpedienteBusquedaResponse> sged,
        List<ExpedienteBusquedaResponse> sgtv2,
        List<ExpedienteBusquedaResponse> sgtv1,
        Pageable pageable
    ) {
        Map<String, ExpedienteBusquedaResponse> unique = new LinkedHashMap<>();
        addUnique(unique, sged);
        addUnique(unique, sgtv2);
        addUnique(unique, sgtv1);

        List<ExpedienteBusquedaResponse> combined = new ArrayList<>(unique.values());
        int start = (int) Math.min(pageable.getOffset(), combined.size());
        int end = (int) Math.min(start + pageable.getPageSize(), combined.size());
        List<ExpedienteBusquedaResponse> slice = combined.subList(start, end);
        return new PageImpl<>(Objects.requireNonNull(slice), Objects.requireNonNull(pageable), combined.size());
    }

    private void addUnique(Map<String, ExpedienteBusquedaResponse> target, List<ExpedienteBusquedaResponse> items) {
        for (ExpedienteBusquedaResponse item : items) {
            if (item.getNumero() == null) {
                continue;
            }
            target.putIfAbsent(item.getNumero(), item);
        }
    }

    private List<ExpedienteBusquedaResponse> mapSged(List<Expediente> expedientes) {
        if (expedientes.isEmpty()) {
            return List.of();
        }
        Set<Long> tipoIds = expedientes.stream().map(Expediente::getTipoProcesoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> estadoIds = expedientes.stream().map(Expediente::getEstadoId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> juzgadoIds = expedientes.stream().map(Expediente::getJuzgadoId).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<Long, String> tipoMap = catTipoProcesoRepository.findAllById(Objects.requireNonNull(tipoIds))
            .stream().collect(Collectors.toMap(item -> item.getId(), item -> item.getNombre()));
        Map<Long, String> estadoMap = catEstadoRepository.findAllById(Objects.requireNonNull(estadoIds))
            .stream().collect(Collectors.toMap(item -> item.getId(), item -> item.getNombre()));
        Map<Long, String> juzgadoMap = catJuzgadoRepository.findAllById(Objects.requireNonNull(juzgadoIds))
            .stream().collect(Collectors.toMap(item -> item.getId(), item -> item.getNombre()));

        return expedientes.stream()
            .map(expediente -> ExpedienteBusquedaResponse.builder()
                .id(expediente.getId())
                .numero(expediente.getNumero())
                .juzgado(juzgadoMap.get(expediente.getJuzgadoId()))
                .estado(estadoMap.get(expediente.getEstadoId()))
                .tipoProceso(tipoMap.get(expediente.getTipoProcesoId()))
                .fechaInicio(expediente.getFechaInicio())
                .fechaUltimoMovimiento(expediente.getFechaModificacion() != null
                    ? expediente.getFechaModificacion()
                    : expediente.getFechaCreacion())
                .fuente("SGED")
                .build())
            .toList();
    }

    private List<ExpedienteBusquedaResponse> mapSgt(List<SgtExpedienteDto> sgt, String fuente) {
        if (sgt.isEmpty()) {
            return List.of();
        }
        return sgt.stream()
            .map(item -> ExpedienteBusquedaResponse.builder()
                .id(null)
                .numero(item.getNumero())
                .juzgado(item.getJuzgadoNombre() != null ? item.getJuzgadoNombre() : item.getJuzgadoCodigo())
                .estado(item.getEstado())
                .tipoProceso(item.getTipoProceso())
                .fechaInicio(item.getFechaInicio())
                .fechaUltimoMovimiento(item.getFechaUltimoMovimiento())
                .fuente(fuente)
                .actorPrincipal(item.getActorPrincipal())
                .demandadoPrincipal(item.getDemandadoPrincipal())
                .build())
            .toList();
    }

    private List<SgtExpedienteDto> filterSgtByJuzgado(
        List<SgtExpedienteDto> items,
        Long juzgadoId,
        String juzgadoCodigo
    ) {
        if (juzgadoId == null && (juzgadoCodigo == null || juzgadoCodigo.isBlank())) {
            return items;
        }
        return items.stream()
            .filter(item -> {
                if (item.getJuzgadoId() != null) {
                    return item.getJuzgadoId().equals(juzgadoId);
                }
                if (item.getJuzgadoCodigo() != null && juzgadoCodigo != null) {
                    return item.getJuzgadoCodigo().equalsIgnoreCase(juzgadoCodigo);
                }
                return false;
            })
            .toList();
    }

    private Usuario getCurrentUser() {
        String username = getCurrentUsername();
        return usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS,
                "Usuario o contraseña incorrectos"));
    }

    private String getCurrentUsername() {
        return SecurityUtil.getCurrentUsername()
            .orElseThrow(() -> new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS,
                "Usuario o contraseña incorrectos"));
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> "ROLE_ADMINISTRADOR".equals(auth.getAuthority()));
    }

    private Long getUserJuzgadoId(Usuario usuario) {
        if (usuario.getJuzgado() == null || usuario.getJuzgado().getId() == null) {
            throw new AccessDeniedException("Usuario sin juzgado asignado");
        }
        return usuario.getJuzgado().getId();
    }
}
