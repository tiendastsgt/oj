package com.oj.sged.infrastructure.persistence.documento.repository;

import com.oj.sged.infrastructure.persistence.documento.CatTipoDocumento;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatTipoDocumentoRepository extends JpaRepository<CatTipoDocumento, Long> {

    Optional<CatTipoDocumento> findByNombreIgnoreCase(String nombre);
}
