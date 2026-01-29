package com.oj.sged.infrastructure.persistence.auth.repository;

import com.oj.sged.infrastructure.persistence.auth.CatRol;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para {@link CatRol}.
 */
@Repository
public interface CatRolRepository extends JpaRepository<CatRol, Long> {

    Optional<CatRol> findByNombre(String nombre);
}
