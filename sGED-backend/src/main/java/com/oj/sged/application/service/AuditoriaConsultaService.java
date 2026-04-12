package com.oj.sged.application.service;

import com.oj.sged.api.dto.response.AuditoriaResponse;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import com.oj.sged.shared.util.AuditAction;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

/**
 * Servicio de consulta de auditoría (HU-018 – Consulta de Auditoría).
 * Permite filtrado avanzado de logs de auditoría con paginación.
 */
@Service
@Transactional(readOnly = true)
public class AuditoriaConsultaService {

    private final AuditoriaRepository auditoriaRepository;
    private final AuditoriaService auditoriaService;

    public AuditoriaConsultaService(
        AuditoriaRepository auditoriaRepository,
        AuditoriaService auditoriaService
    ) {
        this.auditoriaRepository = auditoriaRepository;
        this.auditoriaService = auditoriaService;
    }

    /**
     * Consulta auditoría con filtros dinámicos.
     * Soporta búsqueda por usuario, módulo, acción, rango de fechas y recurso.
     */
    public Page<AuditoriaResponse> consultar(
        String usuario,
        String modulo,
        String accion,
        LocalDateTime fechaDesde,
        LocalDateTime fechaHasta,
        Long recursoId,
        Pageable pageable
    ) {
        // Construir especificación con filtros dinámicos
        Specification<Auditoria> spec = (root, query, cb) -> {
                var predicates = new java.util.ArrayList<>();

                if (usuario != null && !usuario.isEmpty()) {
                    predicates.add(cb.like(
                        cb.lower(root.get("usuario")),
                        "%" + usuario.toLowerCase() + "%"
                    ));
                }

                if (modulo != null && !modulo.isEmpty()) {
                    predicates.add(cb.equal(
                        root.get("modulo"),
                        modulo
                    ));
                }

                if (accion != null && !accion.isEmpty()) {
                    predicates.add(cb.equal(
                        root.get("accion"),
                        accion
                    ));
                }

                if (fechaDesde != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                        root.get("fecha"),
                        fechaDesde
                    ));
                }

                if (fechaHasta != null) {
                    predicates.add(cb.lessThanOrEqualTo(
                        root.get("fecha"),
                        fechaHasta
                    ));
                }

                if (recursoId != null) {
                    predicates.add(cb.equal(
                        root.get("recursoId"),
                        recursoId
                    ));
                }

                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };

        // Ejecutar consulta y mapear resultados
        Page<AuditoriaResponse> resultado = auditoriaRepository.findAll(spec, Objects.requireNonNull(pageable))
            .map(this::mapToResponse);

        // Registrar consulta de auditoría (opcional, si es muy verboso puede omitirse)
        registrarConsultaAuditoria(usuario, modulo, accion, fechaDesde, fechaHasta, recursoId);

        return resultado;
    }

    /**
     * Obtiene detalle de un log de auditoría específico.
     */
    public AuditoriaResponse obtener(Long id) {
        Auditoria auditoria = auditoriaRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Log de auditoría no encontrado"));
        return mapToResponse(auditoria);
    }

    /**
     * Mapea entidad Auditoria a DTO AuditoriaResponse.
     */
    private AuditoriaResponse mapToResponse(Auditoria auditoria) {
        return AuditoriaResponse.builder()
            .id(auditoria.getId())
            .fecha(auditoria.getFecha())
            .usuario(auditoria.getUsuario())
            .ip(auditoria.getIp())
            .accion(auditoria.getAccion())
            .modulo(auditoria.getModulo())
            .recursoId(auditoria.getRecursoId())
            .detalle(auditoria.getDetalle())
            .build();
    }

    /**
     * Registra la consulta de auditoría (opcional).
     * Puede generarse mucha auditoría si se registra cada consulta; usar con criterio.
     */
    private void registrarConsultaAuditoria(
        String usuario,
        String modulo,
        String accion,
        LocalDateTime fechaDesde,
        LocalDateTime fechaHasta,
        Long recursoId
    ) {
        // Construcción del detalle con filtros utilizados
        StringBuilder detalle = new StringBuilder("Consulta auditoría con filtros:");
        if (usuario != null) {
            detalle.append(" usuario=").append(usuario);
        }
        if (modulo != null) {
            detalle.append(" modulo=").append(modulo);
        }
        if (accion != null) {
            detalle.append(" accion=").append(accion);
        }
        if (fechaDesde != null) {
            detalle.append(" desde=").append(fechaDesde);
        }
        if (fechaHasta != null) {
            detalle.append(" hasta=").append(fechaHasta);
        }
        if (recursoId != null) {
            detalle.append(" recursoId=").append(recursoId);
        }

        auditoriaService.registrar(
            AuditAction.CONSULTAR_AUDITORIA,
            AuditAction.MODULO_ADMIN,
            null,
            detalle.toString(),
            "127.0.0.1"
        );
    }
}
