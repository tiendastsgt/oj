package com.oj.sged.infrastructure.persistence.auth.repository;

import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para {@link Auditoria}.
 * Soporta búsquedas complejas con filtros dinámicos a través de JpaSpecificationExecutor.
 */
@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long>, JpaSpecificationExecutor<Auditoria> {

    List<Auditoria> findByUsuarioOrderByFechaDesc(String usuario);

    List<Auditoria> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    List<Auditoria> findByModuloAndAccion(String modulo, String accion);

    List<Auditoria> findByAccionAndRecursoIdOrderByFechaDesc(String accion, Long recursoId);
}
