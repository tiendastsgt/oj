package com.oj.sged.application.service;

import com.oj.sged.api.dto.response.DocumentoResponse;
import com.oj.sged.application.mapper.DocumentoMapper;
import com.oj.sged.infrastructure.persistence.documento.CatTipoDocumento;
import com.oj.sged.infrastructure.persistence.documento.Documento;
import com.oj.sged.infrastructure.persistence.documento.repository.CatTipoDocumentoRepository;
import com.oj.sged.infrastructure.persistence.documento.repository.DocumentoRepository;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import com.oj.sged.infrastructure.persistence.expediente.repository.ExpedienteRepository;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import com.oj.sged.shared.util.DocumentoCategoriaUtil;
import com.oj.sged.shared.util.SecurityUtil;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import lombok.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentoService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoService.class);

    private final DocumentoRepository documentoRepository;
    private final CatTipoDocumentoRepository tipoDocumentoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final DocumentoMapper documentoMapper;
    private final DocumentoStorageService storageService;
    private final DocumentoConversionService conversionService;
    private final FileValidationService validationService;
    private final AuditoriaService auditoriaService;

    public DocumentoService(
        DocumentoRepository documentoRepository,
        CatTipoDocumentoRepository tipoDocumentoRepository,
        ExpedienteRepository expedienteRepository,
        UsuarioRepository usuarioRepository,
        DocumentoMapper documentoMapper,
        DocumentoStorageService storageService,
        DocumentoConversionService conversionService,
        FileValidationService validationService,
        AuditoriaService auditoriaService
    ) {
        this.documentoRepository = documentoRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.expedienteRepository = expedienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.documentoMapper = documentoMapper;
        this.storageService = storageService;
        this.conversionService = conversionService;
        this.validationService = validationService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarPorExpediente(Long expedienteId) {
        Expediente expediente = validarExpedienteExiste(expedienteId);
        validarAccesoExpediente(expediente);
        return documentoRepository.findAllByExpedienteIdAndEliminadoFalse(expedienteId)
            .stream()
            .map(documentoMapper::toResponse)
            .toList();
    }

    @Transactional
    public DocumentoResponse cargarDocumento(Long expedienteId, MultipartFile file, Long tipoDocumentoId, String ip) {
        validationService.validate(file);
        Expediente expediente = validarExpedienteExiste(expedienteId);
        validarAccesoExpediente(expediente);
        String extension = validationService.getExtension(file.getOriginalFilename());

        CatTipoDocumento tipoDocumento = null;
        if (tipoDocumentoId != null) {
            tipoDocumento = tipoDocumentoRepository.findById(tipoDocumentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado"));
        }

        String username = SecurityUtil.getCurrentUsername().orElse("ANONIMO");
        Documento documento = Documento.builder()
            .expediente(expediente)
            .tipoDocumento(tipoDocumento)
            .nombreOriginal(file.getOriginalFilename())
            .nombreStorage("PENDING")
            .ruta("PENDING")
            .tamanio(file.getSize())
            .mimeType(file.getContentType())
            .extension(extension)
            .usuarioCreacion(username)
            .fechaCreacion(LocalDateTime.now())
            .eliminado(false)
            .build();

        Documento saved = documentoRepository.save(Objects.requireNonNull(documento));
        DocumentoStorageService.StoredFileInfo stored = null;
        try {
            stored = storageService.store(expedienteId, saved.getId(), file, extension);
            saved.setNombreStorage(stored.getNombreStorage());
            saved.setRuta(stored.getRutaRelativa());
            saved = documentoRepository.save(saved);
        } catch (Exception ex) {
            if (saved.getId() != null) {
                documentoRepository.deleteById(Objects.requireNonNull(saved.getId()));
            }
            throw ex;
        }
        auditoriaService.registrar("CREAR_DOCUMENTO", "DOCUMENTO", saved.getId(),
            "Carga de documento", ip);
        logger.info("operation=document_upload expedienteId={} documentId={}", expedienteId, saved.getId());
        return documentoMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public DocumentoResponse obtenerDetalle(Long id, String ip) {
        Documento documento = documentoRepository.findByIdAndEliminadoFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        validarAccesoExpediente(documento.getExpediente());
        auditoriaService.registrar("VER_DOCUMENTO", "DOCUMENTO", documento.getId(),
            "Detalle de documento", ip);
        return documentoMapper.toResponse(documento);
    }

    @Transactional(readOnly = true)
    public DocumentoContenido obtenerContenido(Long id, String modo, String ip) {
        Documento documento = documentoRepository.findByIdAndEliminadoFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        validarAccesoExpediente(documento.getExpediente());
        Path path = storageService.resolvePath(documento);
        if (path == null) {
            throw new ResourceNotFoundException("Contenido no disponible");
        }

        String filename = documento.getNombreOriginal();
        String contentType = documento.getMimeType();
        boolean inline = !"attachment".equalsIgnoreCase(modo);

        if (inline && isWord(documento.getExtension())) {
            try {
                Path converted = conversionService.convertToPdf(path);
                filename = replaceExtension(filename, "pdf");
                contentType = "application/pdf";
                auditoriaService.registrar("VER_DOCUMENTO", "DOCUMENTO", documento.getId(),
                    "Visualización (convertido a PDF)", ip);
                return new DocumentoContenido(converted, filename, contentType, true);
            } catch (Exception ex) {
                logger.warn("No se pudo convertir el documento {} a PDF. Enviando archivo original. Causa: {}", documento.getId(), ex.getMessage());
                inline = false;
            }
        }

        String categoria = DocumentoCategoriaUtil.resolveCategoria(documento.getExtension());
        String accion = inline
            ? ("AUDIO".equals(categoria) || "VIDEO".equals(categoria) ? "STREAM_DOCUMENTO" : "VER_DOCUMENTO")
            : "DESCARGAR_DOCUMENTO";
        auditoriaService.registrar(accion, "DOCUMENTO", documento.getId(),
            "Acceso a contenido", ip);
        return new DocumentoContenido(path, filename, contentType, inline);
    }

    @Transactional(readOnly = true)
    public DocumentoContenido obtenerStream(Long id, String ip) {
        Documento documento = documentoRepository.findByIdAndEliminadoFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        validarAccesoExpediente(documento.getExpediente());
        Path path = storageService.resolvePath(documento);
        if (path == null) {
            throw new ResourceNotFoundException("Contenido no disponible");
        }
        auditoriaService.registrar("STREAM_DOCUMENTO", "DOCUMENTO", documento.getId(),
            "Reproducción multimedia", ip);
        return new DocumentoContenido(path, documento.getNombreOriginal(), documento.getMimeType(), true);
    }

    @Transactional
    public void eliminar(Long id, String ip) {
        Documento documento = documentoRepository.findByIdAndEliminadoFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        validarAccesoExpediente(documento.getExpediente());
        String username = SecurityUtil.getCurrentUsername().orElse("ANONIMO");
        documento.setEliminado(true);
        documento.setUsuarioEliminacion(username);
        documento.setFechaEliminacion(LocalDateTime.now());
        documentoRepository.save(documento);
        auditoriaService.registrar("ELIMINAR_DOCUMENTO", "DOCUMENTO", documento.getId(),
            "Eliminación lógica", ip);
    }

    @Transactional(readOnly = true)
    public void registrarImpresion(Long id, String ip) {
        Documento documento = documentoRepository.findByIdAndEliminadoFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        validarAccesoExpediente(documento.getExpediente());
        auditoriaService.registrar("IMPRIMIR_DOCUMENTO", "DOCUMENTO", documento.getId(),
            "Impresión solicitada", ip);
    }

    private Expediente validarExpedienteExiste(Long expedienteId) {
        return expedienteRepository.findById(Objects.requireNonNull(expedienteId))
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));
    }

    private void validarAccesoExpediente(Expediente expediente) {
        if (expediente == null) {
            throw new ResourceNotFoundException("Expediente no encontrado");
        }
        if (isAdmin()) {
            return;
        }
        Usuario usuario = getCurrentUser();
        Long juzgadoId = getUserJuzgadoId(usuario);
        if (juzgadoId == null || !juzgadoId.equals(expediente.getJuzgadoId())) {
            throw new org.springframework.security.access.AccessDeniedException("Acceso denegado");
        }
    }

    private Usuario getCurrentUser() {
        String username = getCurrentUsername();
        return usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private String getCurrentUsername() {
        return SecurityUtil.getCurrentUsername().orElse("ANONIMO");
    }

    private boolean isAdmin() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> "ROLE_ADMINISTRADOR".equals(auth.getAuthority()));
    }

    private Long getUserJuzgadoId(Usuario usuario) {
        if (usuario.getJuzgado() == null || usuario.getJuzgado().getId() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Usuario sin juzgado asignado");
        }
        return usuario.getJuzgado().getId();
    }

    private boolean isWord(String extension) {
        if (extension == null) {
            return false;
        }
        String ext = extension.toLowerCase();
        return ext.equals("doc") || ext.equals("docx");
    }

    private String replaceExtension(String filename, String newExt) {
        if (filename == null) {
            return "documento." + newExt;
        }
        int idx = filename.lastIndexOf('.');
        if (idx < 0) {
            return filename + "." + newExt;
        }
        return filename.substring(0, idx + 1) + newExt;
    }

    @Value
    public static class DocumentoContenido {
        Path path;
        String filename;
        String contentType;
        boolean inline;
    }
}
