package com.oj.sged.infrastructure.persistence.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Entidad JPA para la tabla {@code auditoria}.
 */
@Entity(name = "auditoria")
@Table(name = "auditoria")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "usuario", nullable = false, length = 50)
    private String usuario;

    @Column(name = "ip", nullable = false, length = 45)
    private String ip;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "modulo", nullable = false, length = 50)
    private String modulo;

    @Column(name = "recurso_id")
    private Long recursoId;

    @Lob
    @Column(name = "valor_anterior")
    private String valorAnterior;

    @Lob
    @Column(name = "valor_nuevo")
    private String valorNuevo;

    @Column(name = "detalle", length = 500)
    private String detalle;
}
