package com.oj.sged.application.service;

import com.oj.sged.api.dto.request.ExpedienteRequest;
import com.oj.sged.api.dto.response.ExpedienteEstadisticasResponse;
import com.oj.sged.api.dto.response.ExpedienteResponse;
import com.oj.sged.application.mapper.ExpedienteMapper;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.shared.exception.AuthException;
import com.oj.sged.shared.exception.InvalidReferenceException;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import com.oj.sged.shared.util.SecurityUtil;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExpedienteService {

    private static final String MODULO = "EXPEDIENTE";
    private final ExpedienteRepository expedienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CatTipoProcesoRepository catTipoProcesoRepository;
    private final CatEstadoRepository catEstadoRepository;
    private final ExpedienteMapper expedienteMapper;
    private final AuditoriaService auditoriaService;

    public ExpedienteService(
        ExpedienteRepository expedienteRepository,
        UsuarioRepository usuarioRepository,
        CatTipoProcesoRepository catTipoProcesoRepository,
        CatEstadoRepository catEstadoRepository,
        ExpedienteMapper expedienteMapper,
        AuditoriaService auditoriaService
    ) {
        this.expedienteRepository = expedienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.catTipoProcesoRepository = catTipoProcesoRepository;
        this.catEstadoRepository = catEstadoRepository;
        this.expedienteMapper = expedienteMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public ExpedienteEstadisticasResponse getEstadisticas() {
        // Mismo principio de aislamiento por juzgado que listarExpedientes:
        // ADMIN ve totales globales; el resto ve sólo su juzgado.
        if (isAdmin()) {
            return new ExpedienteEstadisticasResponse(
                expedienteRepository.count(),
                expedienteRepository.countByEstadoId(2L),  // En espera
                expedienteRepository.countByEstadoId(1L),  // Activo
                expedienteRepository.countByEstadoId(4L),  // Cerrado
                expedienteRepository.countByEstadoId(5L)   // Archivado
            );
        }
        Long juzgadoId = getUserJuzgadoId(getCurrentUser());
        return new ExpedienteEstadisticasResponse(
            expedienteRepository.countByJuzgadoId(juzgadoId),
            expedienteRepository.countByJuzgadoIdAndEstadoId(juzgadoId, 2L),
            expedienteRepository.countByJuzgadoIdAndEstadoId(juzgadoId, 1L),
            expedienteRepository.countByJuzgadoIdAndEstadoId(juzgadoId, 4L),
            expedienteRepository.countByJuzgadoIdAndEstadoId(juzgadoId, 5L)
        );
    }

    @Transactional
    public ExpedienteResponse crearExpediente(ExpedienteRequest request, String ip) {
        Usuario usuario = getCurrentUser();
        if (!isAdmin()) {
            Long juzgadoId = getUserJuzgadoId(usuario);
            if (request.getJuzgadoId() != null && !request.getJuzgadoId().equals(juzgadoId)) {
                throw new AccessDeniedException("No puede crear expedientes para otros juzgados");
            }
            request.setJuzgadoId(juzgadoId);
        }

        validateCatalogs(request.getTipoProcesoId(), request.getEstadoId());
        Expediente expediente = expedienteMapper.toEntity(request);
        expediente.setUsuarioCreacion(usuario.getUsername());
        expediente.setFechaCreacion(LocalDateTime.now());
        Expediente saved = expedienteRepository.save(expediente);
        auditoriaService.registrar("CREAR_EXPEDIENTE", MODULO, saved.getId(),
            "Creación de expediente", ip, usuario.getUsername());
        return expedienteMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ExpedienteResponse> listarExpedientes(Pageable pageable) {
        Page<Expediente> page;
        if (isAdmin()) {
            page = expedienteRepository.findAll(Objects.requireNonNull(pageable));
        } else {
            Usuario usuario = getCurrentUser();
            Long juzgadoId = getUserJuzgadoId(usuario);
            page = expedienteRepository.findByJuzgadoId(juzgadoId, pageable);
        }
        return page.map(expedienteMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ExpedienteResponse obtenerDetalleExpediente(Long id, String ip) {
        Expediente expediente = expedienteRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));
        if (!canAccessExpediente(expediente)) {
            throw new AccessDeniedException("Acceso denegado");
        }
        String username = getCurrentUsername();
        auditoriaService.registrar("VER_EXPEDIENTE", MODULO, expediente.getId(),
            "Detalle de expediente", ip, username);
        return expedienteMapper.toResponse(expediente);
    }

    @Transactional
    public ExpedienteResponse editarExpediente(Long id, ExpedienteRequest request, String ip) {
        Expediente expediente = expedienteRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));
        if (!canAccessExpediente(expediente)) {
            throw new AccessDeniedException("Acceso denegado");
        }

        Usuario usuario = getCurrentUser();
        if (!isAdmin()) {
            Long juzgadoId = getUserJuzgadoId(usuario);
            if (request.getJuzgadoId() != null && !request.getJuzgadoId().equals(juzgadoId)) {
                throw new AccessDeniedException("No puede editar expedientes de otros juzgados");
            }
            request.setJuzgadoId(juzgadoId);
        }

        validateCatalogs(request.getTipoProcesoId(), request.getEstadoId());
        expedienteMapper.updateEntity(request, expediente);
        expediente.setUsuarioModificacion(usuario.getUsername());
        expediente.setFechaModificacion(LocalDateTime.now());
        Expediente saved = expedienteRepository.save(expediente);

        auditoriaService.registrar("EDITAR_EXPEDIENTE", MODULO, saved.getId(),
            "Actualización de expediente", ip, usuario.getUsername());
        return expedienteMapper.toResponse(saved);
    }

    private Usuario getCurrentUser() {
        String username = getCurrentUsername();
        Optional<Usuario> usuario = usuarioRepository.findByUsername(username);
        return usuario.orElseThrow(() -> new AuthException(AuthException.AuthErrorCode.INVALID_CREDENTIALS,
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

    private boolean canAccessExpediente(Expediente expediente) {
        if (isAdmin()) {
            return true;
        }
        Usuario usuario = getCurrentUser();
        Long juzgadoId = getUserJuzgadoId(usuario);
        return juzgadoId != null && juzgadoId.equals(expediente.getJuzgadoId());
    }

    private void validateCatalogs(Long tipoProcesoId, Long estadoId) {
        List<String> errors = new ArrayList<>();
        if (tipoProcesoId == null || !catTipoProcesoRepository.existsById(tipoProcesoId)) {
            errors.add("Tipo de proceso inválido");
        }
        if (estadoId == null || !catEstadoRepository.existsById(estadoId)) {
            errors.add("Estado inválido");
        }
        if (!errors.isEmpty()) {
            throw new InvalidReferenceException(errors);
        }
    }
}
