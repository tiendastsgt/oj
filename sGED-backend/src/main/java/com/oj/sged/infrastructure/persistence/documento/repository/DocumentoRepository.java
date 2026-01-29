package com.oj.sged.infrastructure.persistence.documento.repository;

import com.oj.sged.infrastructure.persistence.documento.Documento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @EntityGraph(attributePaths = {"expediente", "tipoDocumento"})
    List<Documento> findAllByExpedienteIdAndEliminadoFalse(Long expedienteId);

    @EntityGraph(attributePaths = {"expediente", "tipoDocumento"})
    Optional<Documento> findByIdAndEliminadoFalse(Long id);
}
