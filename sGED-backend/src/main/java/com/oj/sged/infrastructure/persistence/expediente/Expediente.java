package com.oj.sged.infrastructure.persistence.expediente;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad de expediente digital SGED.
 */
@Entity
@Table(name = "expediente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expediente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero", nullable = false, length = 50)
    private String numero;

    @Column(name = "tipo_proceso_id", nullable = false)
    private Long tipoProcesoId;

    @Column(name = "juzgado_id", nullable = false)
    private Long juzgadoId;

    @Column(name = "estado_id", nullable = false)
    private Long estadoId;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "observaciones", length = 1000)
    private String observaciones;

    @Column(name = "referencia_sgt", length = 50)
    private String referenciaSgt;

    @Column(name = "referencia_fuente", length = 10)
    private String referenciaFuente;

    @Column(name = "usuario_creacion", nullable = false, length = 50)
    private String usuarioCreacion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "usuario_modificacion", length = 50)
    private String usuarioModificacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (fechaModificacion == null) {
            fechaModificacion = LocalDateTime.now();
        }
    }
}
