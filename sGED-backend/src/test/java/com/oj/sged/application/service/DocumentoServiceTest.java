package com.oj.sged.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.oj.sged.api.dto.response.DocumentoResponse;
import com.oj.sged.application.mapper.DocumentoMapper;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.documento.CatTipoDocumento;
import com.oj.sged.infrastructure.persistence.documento.Documento;
import com.oj.sged.infrastructure.persistence.documento.repository.CatTipoDocumentoRepository;
import com.oj.sged.infrastructure.persistence.documento.repository.DocumentoRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.shared.exception.FileTooLargeException;
import com.oj.sged.shared.exception.FileTypeNotAllowedException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class DocumentoServiceTest {

    @Mock
    private DocumentoRepository documentoRepository;
    @Mock
    private CatTipoDocumentoRepository tipoDocumentoRepository;
    @Mock
    private ExpedienteRepository expedienteRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private DocumentoMapper documentoMapper;
    @Mock
    private DocumentoStorageService storageService;
    @Mock
    private DocumentoConversionService conversionService;
    @Mock
    private FileValidationService validationService;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private DocumentoService documentoService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void cargarDocumento_success_callsStoreAndAudits() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Expediente expediente = buildExpediente(1L, 10L);
        MultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", "data".getBytes());

        when(expedienteRepository.findById(1L)).thenReturn(Optional.of(expediente));
        when(validationService.getExtension("doc.pdf")).thenReturn("pdf");
        when(documentoRepository.save(any(Documento.class))).thenAnswer(invocation -> {
            Documento doc = invocation.getArgument(0);
            if (doc.getId() == null) {
                doc.setId(10L);
            }
            return doc;
        });
        when(storageService.store(eq(1L), eq(10L), eq(file), eq("pdf")))
            .thenReturn(new DocumentoStorageService.StoredFileInfo("2026/01/1/10", "10_doc.pdf"));
        when(documentoMapper.toResponse(any(Documento.class)))
            .thenReturn(DocumentoResponse.builder().id(10L).build());

        DocumentoResponse response = documentoService.cargarDocumento(1L, file, null, "10.0.0.1");

        assertEquals(10L, response.getId());
        verify(storageService).store(1L, 10L, file, "pdf");
        verify(auditoriaService).registrar(
            eq("CREAR_DOCUMENTO"), eq("DOCUMENTO"), eq(10L),
            eq("Carga de documento"), eq("10.0.0.1")
        );
    }

    @Test
    void cargarDocumento_sizeTooLarge_throwsValidation() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        MultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", "data".getBytes());
        doThrow(new FileTooLargeException("El archivo excede"))
            .when(validationService).validate(file);

        assertThrows(FileTooLargeException.class,
            () -> documentoService.cargarDocumento(1L, file, null, "10.0.0.2"));
        verify(documentoRepository, never()).save(any());
    }

    @Test
    void cargarDocumento_invalidType_throwsValidation() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        MultipartFile file = new MockMultipartFile("file", "doc.exe", "application/octet-stream", "data".getBytes());
        doThrow(new FileTypeNotAllowedException("Formato no permitido"))
            .when(validationService).validate(file);

        assertThrows(FileTypeNotAllowedException.class,
            () -> documentoService.cargarDocumento(1L, file, null, "10.0.0.3"));
        verify(documentoRepository, never()).save(any());
    }

    @Test
    void listarPorExpediente_returnsNonDeleted() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Expediente expediente = buildExpediente(2L, 10L);
        Documento documento = buildDocumento(expediente, 20L, false);
        when(expedienteRepository.findById(2L)).thenReturn(Optional.of(expediente));
        when(documentoRepository.findAllByExpedienteIdAndEliminadoFalse(2L)).thenReturn(List.of(documento));
        when(documentoMapper.toResponse(documento)).thenReturn(DocumentoResponse.builder().id(20L).build());

        List<DocumentoResponse> response = documentoService.listarPorExpediente(2L);

        assertEquals(1, response.size());
        verify(documentoRepository).findAllByExpedienteIdAndEliminadoFalse(2L);
    }

    @Test
    void obtenerDetalle_otherJuzgado_forbidden() {
        setAuthentication("secretario", "ROLE_SECRETARIO");
        Usuario usuario = buildUsuario("secretario", 10L);
        Expediente expediente = buildExpediente(3L, 99L);
        Documento documento = buildDocumento(expediente, 30L, false);
        when(usuarioRepository.findByUsername("secretario")).thenReturn(Optional.of(usuario));
        when(documentoRepository.findByIdAndEliminadoFalse(30L)).thenReturn(Optional.of(documento));

        assertThrows(AccessDeniedException.class,
            () -> documentoService.obtenerDetalle(30L, "10.0.0.4"));
        verify(auditoriaService, never()).registrar(any(), any(), any(), any(), any());
    }

    @Test
    void obtenerContenido_attachment_auditsDownload() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Expediente expediente = buildExpediente(4L, 10L);
        Documento documento = buildDocumento(expediente, 40L, false);
        documento.setExtension("pdf");
        documento.setMimeType("application/pdf");
        documento.setNombreOriginal("doc.pdf");
        documento.setRuta("2026/01/4/40");
        documento.setNombreStorage("40_doc.pdf");
        when(documentoRepository.findByIdAndEliminadoFalse(40L)).thenReturn(Optional.of(documento));
        when(storageService.resolvePath(documento)).thenReturn(Paths.get("tmp/doc.pdf"));

        DocumentoService.DocumentoContenido contenido = documentoService.obtenerContenido(40L, "attachment", "10.0.0.5");

        assertFalse(contenido.isInline());
        verify(auditoriaService).registrar(
            eq("DESCARGAR_DOCUMENTO"), eq("DOCUMENTO"), eq(40L),
            eq("Acceso a contenido"), eq("10.0.0.5")
        );
    }

    @Test
    void obtenerStream_auditsStream() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Expediente expediente = buildExpediente(5L, 10L);
        Documento documento = buildDocumento(expediente, 50L, false);
        documento.setMimeType("audio/mpeg");
        when(documentoRepository.findByIdAndEliminadoFalse(50L)).thenReturn(Optional.of(documento));
        when(storageService.resolvePath(documento)).thenReturn(Paths.get("tmp/audio.mp3"));

        documentoService.obtenerStream(50L, "10.0.0.6");

        verify(auditoriaService).registrar(
            eq("STREAM_DOCUMENTO"), eq("DOCUMENTO"), eq(50L),
            eq("Reproducción multimedia"), eq("10.0.0.6")
        );
    }

    @Test
    void eliminar_marksDeleted_andAudits() {
        setAuthentication("admin", "ROLE_ADMINISTRADOR");
        Expediente expediente = buildExpediente(6L, 10L);
        Documento documento = buildDocumento(expediente, 60L, false);
        when(documentoRepository.findByIdAndEliminadoFalse(60L)).thenReturn(Optional.of(documento));
        when(documentoRepository.save(any(Documento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        documentoService.eliminar(60L, "10.0.0.7");

        ArgumentCaptor<Documento> captor = ArgumentCaptor.forClass(Documento.class);
        verify(documentoRepository).save(captor.capture());
        assertEquals(true, captor.getValue().getEliminado());
        assertEquals("admin", captor.getValue().getUsuarioEliminacion());
        verify(auditoriaService).registrar(
            eq("ELIMINAR_DOCUMENTO"), eq("DOCUMENTO"), eq(60L),
            eq("Eliminación lógica"), eq("10.0.0.7")
        );
    }

    private Usuario buildUsuario(String username, Long juzgadoId) {
        CatRol rol = CatRol.builder()
            .id(1L)
            .nombre("ADMINISTRADOR")
            .activo(1)
            .build();
        CatJuzgado juzgado = CatJuzgado.builder()
            .id(juzgadoId)
            .codigo("JZ-" + juzgadoId)
            .nombre("Juzgado " + juzgadoId)
            .activo(1)
            .build();
        return Usuario.builder()
            .id(100L)
            .username(username)
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build();
    }

    private Expediente buildExpediente(Long id, Long juzgadoId) {
        return Expediente.builder()
            .id(id)
            .numero("EXP-2026-0001")
            .tipoProcesoId(1L)
            .juzgadoId(juzgadoId)
            .estadoId(1L)
            .fechaInicio(java.time.LocalDate.now())
            .descripcion("Expediente de prueba")
            .usuarioCreacion("admin")
            .fechaCreacion(LocalDateTime.now())
            .build();
    }

    private Documento buildDocumento(Expediente expediente, Long id, boolean eliminado) {
        CatTipoDocumento tipo = CatTipoDocumento.builder()
            .id(1L)
            .nombre("OFICIO")
            .build();
        return Documento.builder()
            .id(id)
            .expediente(expediente)
            .tipoDocumento(tipo)
            .nombreOriginal("doc.pdf")
            .nombreStorage("doc.pdf")
            .ruta("2026/01/1/10")
            .tamanio(100L)
            .mimeType("application/pdf")
            .extension("pdf")
            .usuarioCreacion("admin")
            .fechaCreacion(LocalDateTime.now())
            .eliminado(eliminado)
            .build();
    }

    private void setAuthentication(String username, String role) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            username, null, List.of(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
