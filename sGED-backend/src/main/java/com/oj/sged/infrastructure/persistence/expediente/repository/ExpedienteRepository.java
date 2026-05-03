package com.oj.sged.infrastructure.persistence.expediente.repository;

import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {

    Page<Expediente> findByJuzgadoId(Long juzgadoId, Pageable pageable);

    Page<Expediente> findByNumeroContainingIgnoreCase(String numero, Pageable pageable);

    Page<Expediente> findByNumeroContainingIgnoreCaseAndJuzgadoId(String numero, Long juzgadoId, Pageable pageable);

    long countByEstadoId(Long estadoId);

    long countByJuzgadoId(Long juzgadoId);

    long countByJuzgadoIdAndEstadoId(Long juzgadoId, Long estadoId);

    @Query(value = """
        select e from Expediente e
        where (:numero is null or e.numero like concat('%', :numero, '%'))
          and (:fechaDesde is null or e.fechaInicio >= :fechaDesde)
          and (:fechaHasta is null or e.fechaInicio <= :fechaHasta)
          and (:tipoProcesoId is null or e.tipoProcesoId = :tipoProcesoId)
          and (:estadoId is null or e.estadoId = :estadoId)
          and (:juzgadoId is null or e.juzgadoId = :juzgadoId)
        """,
        countQuery = """
        select count(e) from Expediente e
        where (:numero is null or e.numero like concat('%', :numero, '%'))
          and (:fechaDesde is null or e.fechaInicio >= :fechaDesde)
          and (:fechaHasta is null or e.fechaInicio <= :fechaHasta)
          and (:tipoProcesoId is null or e.tipoProcesoId = :tipoProcesoId)
          and (:estadoId is null or e.estadoId = :estadoId)
          and (:juzgadoId is null or e.juzgadoId = :juzgadoId)
        """)
    Page<Expediente> buscarAvanzada(
        @Param("numero") String numero,
        @Param("fechaDesde") LocalDate fechaDesde,
        @Param("fechaHasta") LocalDate fechaHasta,
        @Param("tipoProcesoId") Long tipoProcesoId,
        @Param("estadoId") Long estadoId,
        @Param("juzgadoId") Long juzgadoId,
        Pageable pageable
    );
}
