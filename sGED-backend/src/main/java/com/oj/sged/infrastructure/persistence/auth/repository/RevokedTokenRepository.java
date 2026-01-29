package com.oj.sged.infrastructure.persistence.auth.repository;

import com.oj.sged.infrastructure.persistence.auth.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para {@link RevokedToken}.
 */
@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {

    boolean existsByTokenJti(String tokenJti);
}
