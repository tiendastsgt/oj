package com.oj.sged.infrastructure.persistence.auth.repository;

import com.oj.sged.infrastructure.persistence.auth.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para {@link Usuario}.
 * Soporta búsquedas complejas con filtros dinámicos a través de JpaSpecificationExecutor.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

    Optional<Usuario> findByUsername(String username);
}
