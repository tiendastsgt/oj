package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.config.AsyncTestConfig;
import com.oj.sged.infrastructure.persistence.auth.Auditoria;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuditoriaRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.documento.Documento;
import com.oj.sged.infrastructure.persistence.documento.repository.DocumentoRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
@TestPropertySource(properties = {
    "sged.documentos.storage.base-path=${java.io.tmpdir}/sged-docs-test",
    "sged.documentos.storage.max-size-bytes=10",
    "sged.documentos.storage.conversion.enabled=false"
})
class DocumentoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private CatRolRepository catRolRepository;
    @Autowired
    private CatJuzgadoRepository catJuzgadoRepository;
    @Autowired
    private ExpedienteRepository expedienteRepository;
    @Autowired
    private DocumentoRepository documentoRepository;
    @Autowired
    private AuditoriaRepository auditoriaRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private CatJuzgado juzgado1;
    private CatJuzgado juzgado2;
    private Expediente expedienteJ1;
    private Expediente expedienteJ2;

    @BeforeEach
    void setUp() {
        auditoriaRepository.deleteAll();
        documentoRepository.deleteAll();
        expedienteRepository.deleteAll();
        usuarioRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catRolRepository.deleteAll();

        juzgado1 = catJuzgadoRepository.save(Objects.requireNonNull(CatJuzgado.builder()
            .codigo("JZ-001")
            .nombre("Juzgado 1")
            .activo(1)
            .build()));
        juzgado2 = catJuzgadoRepository.save(Objects.requireNonNull(CatJuzgado.builder()
            .codigo("JZ-002")
            .nombre("Juzgado 2")
            .activo(1)
            .build()));

        expedienteJ1 = expedienteRepository.save(buildExpediente("EXP-001", juzgado1.getId()));
        expedienteJ2 = expedienteRepository.save(buildExpediente("EXP-002", juzgado2.getId()));
    }

    @Test
    void cargarDocumento_validFile_createsAndAudits() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        MockMultipartFile file = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", "123456789".getBytes());

        mockMvc.perform(multipart("/api/v1/expedientes/" + expedienteJ1.getId() + "/documentos")
                .file(file)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true));

        List<Documento> docs = documentoRepository.findAll();
        assertThat(docs).hasSize(1);
        assertThat(docs.get(0).getExpediente().getId()).isEqualTo(expedienteJ1.getId());

        List<Auditoria> auditorias = auditoriaRepository.findByModuloAndAccion("DOCUMENTO", "CREAR_DOCUMENTO");
        assertThat(auditorias).isNotEmpty();
    }

    @Test
    void cargarDocumento_sizeTooLarge_returns400() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        byte[] big = new byte[11];
        MockMultipartFile file = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", big);

        mockMvc.perform(multipart("/api/v1/expedientes/" + expedienteJ1.getId() + "/documentos")
                .file(file)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            // Contrato de validación: message estándar + errors[]
            .andExpect(jsonPath("$.message").value("Error de validación"))
            .andExpect(jsonPath("$.errors").isArray())
            .andExpect(jsonPath("$.errors[0]").value(
                org.hamcrest.Matchers.containsString("tamaño máximo")));
    }

    @Test
    void cargarDocumento_invalidType_returns400() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        MockMultipartFile file = new MockMultipartFile(
            "file", "doc.exe", "application/octet-stream", "123".getBytes());

        mockMvc.perform(multipart("/api/v1/expedientes/" + expedienteJ1.getId() + "/documentos")
                .file(file)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            // Contrato de validación: message estándar + errors[]
            .andExpect(jsonPath("$.message").value("Error de validación"))
            .andExpect(jsonPath("$.errors").isArray())
            .andExpect(jsonPath("$.errors[0]").value(
                org.hamcrest.Matchers.containsString("Formato de archivo no permitido")));
    }

    @Test
    void listarDocumentos_onlyNotDeleted() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        documentoRepository.save(buildDocumento(expedienteJ1, "doc1.pdf", false));
        documentoRepository.save(buildDocumento(expedienteJ1, "doc2.pdf", true));

        mockMvc.perform(get("/api/v1/expedientes/" + expedienteJ1.getId() + "/documentos")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void contenidoAttachment_returnsAttachmentHeader() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        Documento documento = documentoRepository.save(buildDocumento(expedienteJ1, "doc3.pdf", false));
        Path basePath = Paths.get(System.getProperty("java.io.tmpdir"), "sged-docs-test");
        Path target = basePath.resolve(documento.getRuta()).resolve(documento.getNombreStorage());
        Files.createDirectories(target.getParent());
        Files.write(target, "abc".getBytes());

        mockMvc.perform(get("/api/v1/documentos/" + documento.getId() + "/contenido?modo=attachment")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                org.hamcrest.Matchers.containsString("attachment")));
    }

    @Test
    void streamWithRange_returnsPartialContent() throws Exception {
        Usuario admin = createUser("admin", "ADMINISTRADOR", juzgado1);
        String token = jwtTokenProvider.generateToken(admin);

        Documento documento = documentoRepository.save(buildDocumento(expedienteJ1, "audio.mp3", false));
        documento.setMimeType("audio/mpeg");
        documentoRepository.save(documento);
        Path basePath = Paths.get(System.getProperty("java.io.tmpdir"), "sged-docs-test");
        Path target = basePath.resolve(documento.getRuta()).resolve(documento.getNombreStorage());
        Files.createDirectories(target.getParent());
        Files.write(target, "abcdef".getBytes());

        mockMvc.perform(get("/api/v1/documentos/" + documento.getId() + "/stream")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.RANGE, "bytes=0-3"))
            .andExpect(status().isPartialContent());
    }

    @Test
    void accederDocumento_otroJuzgado_forbidden() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        Documento documento = documentoRepository.save(buildDocumento(expedienteJ2, "doc4.pdf", false));

        mockMvc.perform(get("/api/v1/documentos/" + documento.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void eliminarDocumento_marksDeleted() throws Exception {
        Usuario secretario = createUser("secretario", "SECRETARIO", juzgado1);
        String token = jwtTokenProvider.generateToken(secretario);

        Documento documento = documentoRepository.save(buildDocumento(expedienteJ1, "doc5.pdf", false));

        mockMvc.perform(delete("/api/v1/documentos/" + documento.getId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        Documento updated = documentoRepository.findById(documento.getId()).orElseThrow();
        assertThat(updated.getEliminado()).isTrue();
    }

    private Usuario createUser(String username, String roleName, CatJuzgado juzgado) {
        CatRol rol = catRolRepository.findByNombre(roleName)
            .orElseGet(() -> catRolRepository.save(CatRol.builder()
                .nombre(roleName)
                .descripcion(roleName)
                .activo(1)
                .build()));
        Usuario usuario = Objects.requireNonNull(Usuario.builder()
            .username(username)
            .password(passwordEncoder.encode("Password1"))
            .nombreCompleto("Usuario " + username)
            .email(username + "@oj.local")
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build());
        return usuarioRepository.save(usuario);
    }

    private Expediente buildExpediente(String numero, Long juzgadoId) {
        return Objects.requireNonNull(Expediente.builder()
            .numero(numero)
            .tipoProcesoId(1L)
            .juzgadoId(juzgadoId)
            .estadoId(1L)
            .fechaInicio(LocalDate.now())
            .descripcion("Expediente de prueba")
            .usuarioCreacion("admin")
            .fechaCreacion(LocalDateTime.now())
            .build());
    }

    private Documento buildDocumento(Expediente expediente, String nombreOriginal, boolean eliminado) {
        String ruta = "2026/01/" + expediente.getId() + "/10";
        return Objects.requireNonNull(Documento.builder()
            .expediente(expediente)
            .nombreOriginal(nombreOriginal)
            .nombreStorage("10_" + nombreOriginal)
            .ruta(ruta)
            .tamanio(10L)
            .mimeType("application/pdf")
            .extension("pdf")
            .usuarioCreacion("admin")
            .fechaCreacion(LocalDateTime.now())
            .eliminado(eliminado)
            .build());
    }
}
