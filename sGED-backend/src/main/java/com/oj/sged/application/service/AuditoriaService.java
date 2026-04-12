package com.oj.sged.application.service;

import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.shared.util.SecurityUtil;
import java.time.LocalDateTime;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditoriaService {

    private static final Logger logger = LoggerFactory.getLogger(AuditoriaService.class);
    private final AuditoriaRepository auditoriaRepository;

    public AuditoriaService(AuditoriaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @Async
    public void registrar(String accion, String modulo, Long recursoId, String detalle, String ip) {
        try {
            String username = SecurityUtil.getCurrentUsername().orElse("ANONIMO");
            registrar(accion, modulo, recursoId, detalle, ip, username);
        } catch (Exception ex) {
            logger.warn("operation=audit_log status=error message={}", ex.getMessage());
        }
    }

    @Async
    public void registrar(
        String accion,
        String modulo,
        Long recursoId,
        String detalle,
        String ip,
        String usuario
    ) {
        try {
            Auditoria auditoria = Auditoria.builder()
                .fecha(LocalDateTime.now())
                .usuario(usuario != null ? usuario : "ANONIMO")
                .ip(ip)
                .accion(accion)
                .modulo(modulo)
                .recursoId(recursoId)
                .detalle(detalle)
                .build();
            auditoriaRepository.save(Objects.requireNonNull(auditoria));
        } catch (Exception ex) {
            logger.warn("operation=audit_log status=error message={}", ex.getMessage());
        }
    }
}
