package com.oj.sged.infrastructure.persistence.documento.repository;

import com.oj.sged.infrastructure.persistence.documento.Documento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @EntityGraph(attributePaths = {"expediente", "tipoDocumento"})
    List<Documento> findAllByExpedienteIdAndEliminadoFalseOrderByOrdenAscIdAsc(Long expedienteId);

    @EntityGraph(attributePaths = {"expediente", "tipoDocumento"})
    Optional<Documento> findByIdAndEliminadoFalse(Long id);

    /** Mayor valor de orden asignado en el expediente (0 si no hay documentos). */
    @Query("SELECT COALESCE(MAX(d.orden), 0) FROM Documento d WHERE d.expediente.id = :expedienteId")
    Long findMaxOrdenByExpedienteId(@Param("expedienteId") Long expedienteId);
}
