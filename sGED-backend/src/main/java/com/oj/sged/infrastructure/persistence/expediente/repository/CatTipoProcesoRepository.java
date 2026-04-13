package com.oj.sged.infrastructure.persistence.expediente.repository;

import com.oj.sged.infrastructure.persistence.expediente.CatTipoProceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatTipoProcesoRepository extends JpaRepository<CatTipoProceso, Long> {
    Optional<CatTipoProceso> findByNombre(String nombre);
}
