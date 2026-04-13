package com.oj.sged.infrastructure.persistence.expediente.repository;

import com.oj.sged.infrastructure.persistence.expediente.CatEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatEstadoRepository extends JpaRepository<CatEstado, Long> {
    Optional<CatEstado> findByNombre(String nombre);
}
