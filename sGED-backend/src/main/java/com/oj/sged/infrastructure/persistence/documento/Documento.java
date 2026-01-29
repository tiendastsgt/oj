package com.oj.sged.infrastructure.persistence.documento;

import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Documento asociado a un expediente.
 */
@Entity
@Table(name = "documento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente_id", nullable = false)
    private Expediente expediente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_documento_id")
    private CatTipoDocumento tipoDocumento;

    @Column(name = "nombre_original", nullable = false, length = 255)
    private String nombreOriginal;

    @Column(name = "nombre_storage", nullable = false, length = 100)
    private String nombreStorage;

    @Column(name = "ruta", nullable = false, length = 500)
    private String ruta;

    @Column(name = "tamanio", nullable = false)
    private Long tamanio;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "extension", nullable = false, length = 10)
    private String extension;

    @Column(name = "usuario_creacion", nullable = false, length = 50)
    private String usuarioCreacion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "eliminado", nullable = false)
    private Boolean eliminado;

    @Column(name = "usuario_eliminacion", length = 50)
    private String usuarioEliminacion;

    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (eliminado == null) {
            eliminado = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (eliminado == null) {
            eliminado = false;
        }
    }
}
