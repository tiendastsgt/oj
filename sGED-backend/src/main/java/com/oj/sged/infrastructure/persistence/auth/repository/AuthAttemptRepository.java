package com.oj.sged.infrastructure.persistence.auth.repository;

import com.oj.sged.infrastructure.persistence.auth.AuthAttempt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para {@link AuthAttempt}.
 */
@Repository
public interface AuthAttemptRepository extends JpaRepository<AuthAttempt, Long> {

    List<AuthAttempt> findByUsernameOrderByFechaIntentoDesc(String username);
}
