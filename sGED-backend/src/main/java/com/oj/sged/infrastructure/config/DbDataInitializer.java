package com.oj.sged.infrastructure.config;

import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.documento.CatTipoDocumento;
import com.oj.sged.infrastructure.persistence.documento.Documento;
import com.oj.sged.infrastructure.persistence.documento.repository.CatTipoDocumentoRepository;
import com.oj.sged.infrastructure.persistence.documento.repository.DocumentoRepository;
import com.oj.sged.infrastructure.persistence.expediente.CatEstado;
import com.oj.sged.infrastructure.persistence.expediente.CatTipoProceso;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DbDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DbDataInitializer.class);

    private final CatRolRepository rolRepository;
    private final CatJuzgadoRepository juzgadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CatEstadoRepository estadoRepository;
    private final CatTipoProcesoRepository tipoProcesoRepository;
    private final CatTipoDocumentoRepository tipoDocumentoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final DocumentoRepository documentoRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${sged.documentos.storage.base-path}")
    private String storagePath;

    public DbDataInitializer(
        CatRolRepository rolRepository,
        CatJuzgadoRepository juzgadoRepository,
        UsuarioRepository usuarioRepository,
        CatEstadoRepository estadoRepository,
        CatTipoProcesoRepository tipoProcesoRepository,
        CatTipoDocumentoRepository tipoDocumentoRepository,
        ExpedienteRepository expedienteRepository,
        DocumentoRepository documentoRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.rolRepository = rolRepository;
        this.juzgadoRepository = juzgadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.estadoRepository = estadoRepository;
        this.tipoProcesoRepository = tipoProcesoRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.expedienteRepository = expedienteRepository;
        this.documentoRepository = documentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Iniciando semillado profundo de datos v1.2.1 (Elite UX)...");

        // 1. Catálogos de Autenticación
        CatRol adminRol = ensureRol("ADMINISTRADOR", "Acceso total al sistema");
        CatRol secretarioRol = ensureRol("SECRETARIO", "Gestión de expedientes");
        CatRol juezRol = ensureRol("JUEZ", "Firma y resolución");
        CatRol consultaRol = ensureRol("CONSULTA", "Solo lectura");

        CatJuzgado juzgado = ensureJuzgado("JUZ-GEN-01", "Juzgado General de Pruebas");

        // 2. Usuarios QA
        String qaPassHash = passwordEncoder.encode("QAPassword123!");
        ensureUser("admin.qa", qaPassHash, "Administrador QA", "admin.qa@oj.gob.gt", adminRol, juzgado);
        ensureUser("secretario.qa", qaPassHash, "Secretario QA", "secretario.qa@oj.gob.gt", secretarioRol, juzgado);
        ensureUser("juez.qa", qaPassHash, "Juez QA", "juez.qa@oj.gob.gt", juezRol, juzgado);
        ensureUser("consulta.qa", qaPassHash, "Consulta QA", "consulta.qa@oj.gob.gt", consultaRol, juzgado);

        // 3. Catálogos de Expediente
        CatEstado estadoActivo = ensureEstado("ACTIVO", "Expediente en trámite activo");
        CatEstado estadoCerrado = ensureEstado("CERRADO", "Expediente finalizado");
        CatEstado estadoPendiente = ensureEstado("PENDIENTE", "Pendiente de revisión inicial");

        CatTipoProceso procesoCivil = ensureTipoProceso("CIVIL", "Proceso de naturaleza civil");
        CatTipoProceso procesoPenal = ensureTipoProceso("PENAL", "Proceso de naturaleza penal");

        // 4. Catálogos de Documento
        CatTipoDocumento tipoPdf = ensureTipoDocumento("PDF", "Documento Portable PDF");
        CatTipoDocumento tipoAudio = ensureTipoDocumento("AUDIO", "Grabación de audiencia MP3");
        CatTipoDocumento tipoVideo = ensureTipoDocumento("VIDEO", "Registro visual de diligencia MP4");
        CatTipoDocumento tipoWord = ensureTipoDocumento("WORD", "Minuta de resolución DOCX");

        // 5. Semillado de Expedientes y Documentos Reales (Mockeados físicamente)
        if (expedienteRepository.count() == 0) {
            seedExpedientes(juzgado, estadoActivo, estadoPendiente, procesoCivil, procesoPenal, tipoPdf, tipoAudio, tipoVideo, tipoWord);
        }

        log.info("Semillado profundo completado exitosamente.");
    }

    private void seedExpedientes(CatJuzgado juzgado, CatEstado activo, CatEstado pendiente, 
                                 CatTipoProceso civil, CatTipoProceso penal,
                                 CatTipoDocumento pdf, CatTipoDocumento audio, 
                                 CatTipoDocumento video, CatTipoDocumento word) {
        
        log.info("Semillando expedientes de prueba...");
        
        Expediente e1 = createExpediente("01004-2026-00045", civil, juzgado, activo, "Juicio Ordinario de Daños y Perjuicios");
        Expediente e2 = createExpediente("01108-2026-01234", penal, juzgado, activo, "Proceso Penal por Estafa Propia");
        Expediente e3 = createExpediente("01004-2026-00088", civil, juzgado, pendiente, "Cobro por la vía Ejecutiva");

        // Crear archivos físicos de prueba si no existen
        ensurePhysicalStorage();

        // Documentos para E1
        createDocumento(e1, pdf, "Demanda_Inicial.pdf", "application/pdf", "pdf");
        createDocumento(e1, word, "Resolucion_Admision.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx");
        
        // Documentos para E2 (Multimedia)
        createDocumento(e2, audio, "Audiencia_Declaracion.mp3", "audio/mpeg", "mp3");
        createDocumento(e2, video, "Diligencia_Reconstruccion.mp4", "video/mp4", "mp4");
        createDocumento(e2, pdf, "Auto_Procesamiento.pdf", "application/pdf", "pdf");

        // Documentos para E3
        createDocumento(e3, pdf, "Memorial_Interposicion.pdf", "application/pdf", "pdf");
    }

    private Expediente createExpediente(String numero, CatTipoProceso tipo, CatJuzgado juzgado, CatEstado estado, String desc) {
        return expedienteRepository.save(Expediente.builder()
            .numero(numero)
            .tipoProcesoId(tipo.getId())
            .juzgadoId(juzgado.getId())
            .estadoId(estado.getId())
            .fechaInicio(LocalDate.now().minusMonths(1))
            .descripcion(desc)
            .usuarioCreacion("admin.qa")
            .fechaCreacion(LocalDateTime.now())
            .build());
    }

    private void createDocumento(Expediente e, CatTipoDocumento tipo, String nombre, String mime, String ext) {
        String storageName = "seed_" + System.currentTimeMillis() + "_" + nombre;
        
        // Crear archivo dummy físico para que el visor no de error de 'archivo no encontrado'
        try {
            Path path = Paths.get(storagePath, storageName);
            if (!Files.exists(path)) {
                Files.write(path, "Contenido de prueba para SGED v1.2.1".getBytes());
            }
        } catch (IOException ex) {
            log.error("Error creando archivo físico de prueba: {}", ex.getMessage());
        }

        documentoRepository.save(Documento.builder()
            .expediente(e)
            .tipoDocumento(tipo)
            .nombreOriginal(nombre)
            .nombreStorage(storageName)
            .ruta(storageName)
            .tamanio(1024L)
            .mimeType(mime)
            .extension(ext)
            .usuarioCreacion("admin.qa")
            .fechaCreacion(LocalDateTime.now())
            .eliminado(false)
            .build());
    }

    private void ensurePhysicalStorage() {
        try {
            Files.createDirectories(Paths.get(storagePath));
        } catch (IOException e) {
            log.error("No se pudo crear el directorio de almacenamiento: {}", storagePath);
        }
    }

    private CatRol ensureRol(String nombre, String descripcion) {
        return rolRepository.findByNombre(nombre)
            .orElseGet(() -> rolRepository.save(CatRol.builder()
                .nombre(nombre).descripcion(descripcion).activo(1).build()));
    }

    private CatJuzgado ensureJuzgado(String codigo, String nombre) {
        return juzgadoRepository.findByCodigo(codigo)
            .orElseGet(() -> juzgadoRepository.save(CatJuzgado.builder()
                .codigo(codigo).nombre(nombre).activo(1).build()));
    }

    private CatEstado ensureEstado(String nombre, String descripcion) {
        return estadoRepository.findByNombre(nombre)
            .orElseGet(() -> estadoRepository.save(CatEstado.builder()
                .nombre(nombre).descripcion(descripcion).activo(1).build()));
    }

    private CatTipoProceso ensureTipoProceso(String nombre, String descripcion) {
        return tipoProcesoRepository.findByNombre(nombre)
            .orElseGet(() -> tipoProcesoRepository.save(CatTipoProceso.builder()
                .nombre(nombre).descripcion(descripcion).activo(1).build()));
    }

    private CatTipoDocumento ensureTipoDocumento(String nombre, String descripcion) {
        return tipoDocumentoRepository.findByNombreIgnoreCase(nombre)
            .orElseGet(() -> tipoDocumentoRepository.save(CatTipoDocumento.builder()
                .nombre(nombre).descripcion(descripcion).build()));
    }

    private void ensureUser(String username, String password, String nombre, String email, CatRol rol, CatJuzgado juzgado) {
        if (usuarioRepository.findByUsername(username).isEmpty()) {
            usuarioRepository.save(Usuario.builder()
                .username(username).password(password).nombreCompleto(nombre).email(email)
                .rol(rol).juzgado(juzgado).activo(1).bloqueado(0).intentosFallidos(0)
                .debeCambiarPass(0).fechaCreacion(LocalDateTime.now()).build());
        }
    }
}
