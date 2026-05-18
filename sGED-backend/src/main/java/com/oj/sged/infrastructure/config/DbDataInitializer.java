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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DbDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DbDataInitializer.class);
    private static final String SEED_RUTA = "seed";
    private static final String SAMPLES_CLASSPATH = "seed-samples/";

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
        log.info("Iniciando semillado profundo de datos v2.0 (catálogos OJ-GT + documentos reales)...");

        // 1. Roles
        CatRol adminRol = ensureRol("ADMINISTRADOR", "Acceso total al sistema");
        CatRol secretarioRol = ensureRol("SECRETARIO", "Gestión de expedientes");
        CatRol juezRol = ensureRol("JUEZ", "Firma y resolución");
        ensureRol("CONSULTA", "Solo lectura");

        CatJuzgado juzgado = ensureJuzgado("JUZ-GEN-01", "Juzgado General de Pruebas");

        // 2. Usuarios QA
        String qaPassHash = passwordEncoder.encode("QAPassword123!");
        ensureUser("admin.qa", qaPassHash, "Administrador QA", "admin.qa@oj.gob.gt", adminRol, juzgado);
        ensureUser("secretario.qa", qaPassHash, "Secretario QA", "secretario.qa@oj.gob.gt", secretarioRol, juzgado);
        ensureUser("juez.qa", qaPassHash, "Juez QA", "juez.qa@oj.gob.gt", juezRol, juzgado);

        // 3. Estados
        CatEstado estadoActivo = ensureEstado("ACTIVO", "Expediente en trámite activo");
        CatEstado estadoCerrado = ensureEstado("CERRADO", "Expediente finalizado");
        CatEstado estadoPendiente = ensureEstado("PENDIENTE", "Pendiente de revisión inicial");

        // 4. Tipos de proceso — 9 ramos principales del OJ Guatemala
        Map<String, CatTipoProceso> procesos = new HashMap<>();
        procesos.put("CIVIL", ensureTipoProceso("Civil", "Procesos civiles: ordinario, oral, sumario, ejecución"));
        procesos.put("PENAL", ensureTipoProceso("Penal", "Procesos penales, narcoactividad y delitos contra el ambiente"));
        procesos.put("LABORAL", ensureTipoProceso("Laboral", "Trabajo y previsión social"));
        procesos.put("FAMILIA", ensureTipoProceso("Familia", "Alimentos, divorcio, adopción, patria potestad, filiación"));
        procesos.put("MERCANTIL", ensureTipoProceso("Mercantil", "Mercantil ordinario, quiebras, suspensión de pagos"));
        procesos.put("NINEZ", ensureTipoProceso("Niñez y Adolescencia", "Protección de derechos de niñez y adolescencia"));
        procesos.put("FEMICIDIO", ensureTipoProceso("Femicidio y VCM", "Femicidio y violencia contra la mujer (Decreto 22-2008)"));
        procesos.put("CONTENCIOSO", ensureTipoProceso("Contencioso Administrativo", "Impugnación de actos administrativos del Estado"));
        procesos.put("ECONOMICO", ensureTipoProceso("Económico Coactivo", "Cobros tributarios y obligaciones fiscales"));

        // 5. Tipos de documento — 27 tipos agrupados en 6 grupos
        // Grupo 1: Memoriales de las partes (8)
        ensureTipoDocumento("Demanda", "Memoriales de parte — Escrito inicial del proceso");
        ensureTipoDocumento("Contestación de demanda", "Memoriales de parte — Respuesta del demandado");
        ensureTipoDocumento("Reconvención", "Memoriales de parte — Contrademanda");
        ensureTipoDocumento("Ampliación de demanda", "Memoriales de parte — Art. 110 CPCYM");
        ensureTipoDocumento("Memorial general", "Memoriales de parte — Escrito ordinario de las partes");
        ensureTipoDocumento("Excepciones", "Memoriales de parte — Previas o perentorias");
        ensureTipoDocumento("Allanamiento", "Memoriales de parte — Aceptación o desistimiento");
        ensureTipoDocumento("Recursos", "Memoriales de parte — Apelación, casación, reposición, nulidad, amparo");

        // Grupo 2: Resoluciones del tribunal (4)
        ensureTipoDocumento("Decreto", "Resolución del tribunal — Trámite o providencia");
        ensureTipoDocumento("Auto", "Resolución del tribunal — Decisión interlocutoria");
        ensureTipoDocumento("Sentencia", "Resolución del tribunal — Decisión de fondo");
        ensureTipoDocumento("Razón", "Resolución del tribunal — Constancia del secretario");

        // Grupo 3: Actas (4)
        ensureTipoDocumento("Acta de audiencia", "Acta — Audiencia oral");
        ensureTipoDocumento("Acta de declaración", "Acta — Declaración de testigo, parte o sindicado");
        ensureTipoDocumento("Acta de inspección ocular", "Acta — Diligencia in situ");
        ensureTipoDocumento("Acta de remate", "Acta — Remate o embargo");

        // Grupo 4: Comunicaciones (4)
        ensureTipoDocumento("Cédula de notificación", "Comunicación — Notificación formal a las partes");
        ensureTipoDocumento("Edicto", "Comunicación — Notificación por publicación");
        ensureTipoDocumento("Exhorto", "Comunicación — Despacho o suplicatorio entre tribunales");
        ensureTipoDocumento("Oficio", "Comunicación — A entes externos");

        // Grupo 5: Pruebas (4)
        ensureTipoDocumento("Prueba documental", "Prueba — DPI, contratos, certificaciones");
        ensureTipoDocumento("Prueba pericial", "Prueba — Dictamen pericial");
        ensureTipoDocumento("Prueba testimonial", "Prueba — Declaración escrita");
        ensureTipoDocumento("Prueba multimedia", "Prueba — Audio, video o imagen");

        // Grupo 6: Administrativos (3)
        ensureTipoDocumento("Carátula del expediente", "Administrativo — Identificación del expediente");
        ensureTipoDocumento("Mandato", "Administrativo — Carta poder o representación legal");
        ensureTipoDocumento("Otro", "Administrativo — Otro tipo no clasificado");

        // 6. Migración: corregir documentos seed con ruta incorrecta
        repararRutasSeed();

        // 7. Semillado de expedientes
        if (expedienteRepository.count() == 0) {
            seedExpedientes(juzgado, estadoActivo, estadoPendiente, estadoCerrado, procesos);
        }

        log.info("Semillado profundo completado exitosamente.");
    }

    private void seedExpedientes(CatJuzgado juzgado, CatEstado activo, CatEstado pendiente, CatEstado cerrado,
                                 Map<String, CatTipoProceso> procesos) {
        log.info("Semillando expedientes de prueba con documentos reales...");
        ensurePhysicalStorage();

        // Mapa de tipos de documento cacheado para evitar 21 queries en el loop
        Map<String, CatTipoDocumento> tipos = new HashMap<>();
        tipoDocumentoRepository.findAll().forEach(t -> tipos.put(t.getNombre(), t));

        // E1 — Civil ordinario (ACTIVO) — 4 docs
        Expediente e1 = createExpediente("01173-2026-00045", procesos.get("CIVIL"), juzgado, activo,
            "Juicio Ordinario de Daños y Perjuicios");
        createDocumento(e1, tipos.get("Demanda"), "Demanda_Inicial.pdf", "pdf");
        createDocumento(e1, tipos.get("Auto"), "Auto_Admision.pdf", "pdf");
        createDocumento(e1, tipos.get("Contestación de demanda"), "Contestacion.docx", "docx");
        createDocumento(e1, tipos.get("Sentencia"), "Sentencia_Primera_Instancia.pdf", "pdf");

        // E2 — Penal con multimedia COMPLETO (ACTIVO) — 6 docs (1 de cada tipo de archivo soportado)
        Expediente e2 = createExpediente("01108-2026-01234", procesos.get("PENAL"), juzgado, activo,
            "Proceso Penal por Estafa Propia");
        createDocumento(e2, tipos.get("Demanda"), "Querella_Inicial.pdf", "pdf");
        createDocumento(e2, tipos.get("Auto"), "Auto_Procesamiento.docx", "docx");
        createDocumento(e2, tipos.get("Acta de audiencia"), "Audiencia_Primera_Declaracion.mp3", "mp3");
        createDocumento(e2, tipos.get("Prueba multimedia"), "Reconstruccion_Hechos.mp4", "mp4");
        createDocumento(e2, tipos.get("Prueba documental"), "Foto_Escena.jpg", "jpg");
        createDocumento(e2, tipos.get("Acta de declaración"), "Declaracion_Testigo.pdf", "pdf");

        // E3 — Laboral (ACTIVO) — 3 docs
        Expediente e3 = createExpediente("01024-2026-00088", procesos.get("LABORAL"), juzgado, activo,
            "Juicio Ordinario Laboral por Despido Injustificado");
        createDocumento(e3, tipos.get("Demanda"), "Demanda_Laboral.pdf", "pdf");
        createDocumento(e3, tipos.get("Acta de audiencia"), "Audiencia_Conciliacion.docx", "docx");
        createDocumento(e3, tipos.get("Sentencia"), "Sentencia_Laboral.pdf", "pdf");

        // E4 — Familia / Alimentos (ACTIVO) — 3 docs
        Expediente e4 = createExpediente("01044-2026-00321", procesos.get("FAMILIA"), juzgado, activo,
            "Pensión Alimenticia Provisional");
        createDocumento(e4, tipos.get("Demanda"), "Demanda_Alimentos.pdf", "pdf");
        createDocumento(e4, tipos.get("Auto"), "Resolucion_Provisional.pdf", "pdf");
        createDocumento(e4, tipos.get("Cédula de notificación"), "Notificacion_Demandado.docx", "docx");

        // E5 — Femicidio (PENDIENTE) — 3 docs con multimedia clave
        Expediente e5 = createExpediente("01069-2026-00012", procesos.get("FEMICIDIO"), juzgado, pendiente,
            "Femicidio en grado de tentativa — Decreto 22-2008");
        createDocumento(e5, tipos.get("Demanda"), "Querella_Femicidio.pdf", "pdf");
        createDocumento(e5, tipos.get("Prueba documental"), "Foto_Lugar_Hechos.jpg", "jpg");
        createDocumento(e5, tipos.get("Prueba multimedia"), "Audio_Llamada_911.mp3", "mp3");

        // E6 — Mercantil ejecución (CERRADO) — 2 docs
        Expediente e6 = createExpediente("01075-2025-00992", procesos.get("MERCANTIL"), juzgado, cerrado,
            "Ejecución Mercantil por Cobro de Pagaré");
        createDocumento(e6, tipos.get("Memorial general"), "Memorial_Ejecucion.pdf", "pdf");
        createDocumento(e6, tipos.get("Sentencia"), "Sentencia_Ejecucion.pdf", "pdf");

        log.info("Sembrados 6 expedientes con 21 documentos físicos reales.");
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

    /**
     * Crea un documento copiando el archivo de muestra correspondiente desde
     * el classpath (src/main/resources/seed-samples/sample.<ext>) hacia el
     * directorio de storage. Funciona en Windows, Docker y entornos de test.
     */
    private void createDocumento(Expediente e, CatTipoDocumento tipo, String nombreOriginal, String ext) {
        String storageName = "seed_" + System.currentTimeMillis() + "_" + nombreOriginal;
        long tamanio = copySampleToStorage(ext, storageName);

        documentoRepository.save(Documento.builder()
            .expediente(e)
            .tipoDocumento(tipo)
            .nombreOriginal(nombreOriginal)
            .nombreStorage(storageName)
            .ruta(SEED_RUTA)
            .tamanio(tamanio)
            .mimeType(mimeFor(ext))
            .extension(ext)
            .usuarioCreacion("admin.qa")
            .fechaCreacion(LocalDateTime.now())
            .eliminado(false)
            .build());
    }

    /**
     * Copia seed-samples/sample.<ext> desde el classpath al directorio de
     * storage y devuelve el tamaño real del archivo escrito (0 si falla).
     */
    private long copySampleToStorage(String ext, String storageName) {
        String sampleName = "sample." + ext.toLowerCase(Locale.ROOT);
        ClassPathResource resource = new ClassPathResource(SAMPLES_CLASSPATH + sampleName);
        if (!resource.exists()) {
            log.warn("Sample no encontrado en classpath: {}", sampleName);
            return 0L;
        }
        try {
            Path dir = Paths.get(storagePath, SEED_RUTA);
            Files.createDirectories(dir);
            Path target = dir.resolve(storageName);
            try (InputStream in = resource.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return Files.size(target);
        } catch (IOException ex) {
            log.error("Error copiando sample {} a storage: {}", sampleName, ex.getMessage());
            return 0L;
        }
    }

    private String mimeFor(String ext) {
        return switch (ext.toLowerCase(Locale.ROOT)) {
            case "pdf"  -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "doc"  -> "application/msword";
            case "mp3"  -> "audio/mpeg";
            case "mp4"  -> "video/mp4";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png"  -> "image/png";
            default     -> "application/octet-stream";
        };
    }

    /**
     * Corrige registros seed que tienen ruta == nombreStorage (bug de versiones anteriores).
     */
    private void repararRutasSeed() {
        documentoRepository.findAll().stream()
            .filter(d -> !Boolean.TRUE.equals(d.getEliminado()))
            .filter(d -> d.getRuta() != null && d.getRuta().equals(d.getNombreStorage()))
            .forEach(d -> {
                Path oldFile = Paths.get(storagePath, d.getNombreStorage());
                Path newDir  = Paths.get(storagePath, SEED_RUTA);
                Path newFile = newDir.resolve(d.getNombreStorage());
                try {
                    Files.createDirectories(newDir);
                    if (Files.exists(oldFile) && !Files.exists(newFile)) {
                        Files.move(oldFile, newFile);
                    }
                } catch (IOException ex) {
                    log.warn("No se pudo mover archivo seed id={}: {}", d.getId(), ex.getMessage());
                }
                d.setRuta(SEED_RUTA);
                documentoRepository.save(d);
                log.info("Ruta corregida para documento seed id={}", d.getId());
            });
    }

    private void ensurePhysicalStorage() {
        try {
            Files.createDirectories(Paths.get(storagePath));
            Files.createDirectories(Paths.get(storagePath, SEED_RUTA));
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
        Optional<Usuario> existing = usuarioRepository.findByUsername(username);
        if (existing.isEmpty()) {
            usuarioRepository.save(Usuario.builder()
                .username(username).password(password).nombreCompleto(nombre).email(email)
                .rol(rol).juzgado(juzgado).activo(1).bloqueado(0).intentosFallidos(0)
                .debeCambiarPass(0).fechaCreacion(LocalDateTime.now()).build());
        } else {
            Usuario u = existing.get();
            u.setRol(rol);
            usuarioRepository.save(u);
        }
    }
}
