package com.oj.sged.infrastructure.persistence.auth.repository;

import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para {@link CatJuzgado}.
 */
@Repository
public interface CatJuzgadoRepository extends JpaRepository<CatJuzgado, Long> {

    Optional<CatJuzgado> findByCodigo(String codigo);
}
