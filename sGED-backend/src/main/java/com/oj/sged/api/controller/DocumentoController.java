package com.oj.sged.api.controller;

import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.DocumentoResponse;
import com.oj.sged.application.service.DocumentoService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
public class DocumentoController {

    private static final String HEADER_IP = "X-Forwarded-For";

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @GetMapping("/expedientes/{id}/documentos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    public ResponseEntity<ApiResponse<List<DocumentoResponse>>> listar(@PathVariable("id") Long expedienteId) {
        List<DocumentoResponse> documentos = documentoService.listarPorExpediente(expedienteId);
        return ResponseEntity.ok(ApiResponse.ok("Listado de documentos", documentos));
    }

    @PostMapping("/expedientes/{id}/documentos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR')")
    public ResponseEntity<ApiResponse<DocumentoResponse>> cargar(
        @PathVariable("id") Long expedienteId,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "tipoDocumentoId", required = false) Long tipoDocumentoId,
        HttpServletRequest request
    ) {
        DocumentoResponse response = documentoService.cargarDocumento(expedienteId, file, tipoDocumentoId, getClientIp(request));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Documento cargado exitosamente", response));
    }

    @GetMapping("/documentos/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    public ResponseEntity<ApiResponse<DocumentoResponse>> detalle(
        @PathVariable("id") Long documentoId,
        HttpServletRequest request
    ) {
        DocumentoResponse response = documentoService.obtenerDetalle(documentoId, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.ok("Detalle de documento", response));
    }

    @GetMapping("/documentos/{id}/contenido")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    public ResponseEntity<?> contenido(
        @PathVariable("id") Long documentoId,
        @RequestParam(value = "modo", defaultValue = "inline") String modo,
        @RequestHeader HttpHeaders headers,
        HttpServletRequest request
    ) throws IOException {
        DocumentoService.DocumentoContenido contenido = documentoService.obtenerContenido(documentoId, modo, getClientIp(request));
        Resource resource = toResource(contenido.getPath());
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            mediaType = MediaType.parseMediaType(contenido.getContentType());
        } catch (Exception ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        ContentDisposition disposition = buildDisposition(contenido.isInline(), contenido.getFilename());

        if (!headers.getRange().isEmpty()) {
            return buildRangeResponse(resource, headers, mediaType, disposition);
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .contentLength(resource.contentLength())
            .body(resource);
    }

    @GetMapping("/documentos/{id}/stream")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    public ResponseEntity<?> stream(
        @PathVariable("id") Long documentoId,
        @RequestHeader HttpHeaders headers,
        HttpServletRequest request
    ) throws IOException {
        DocumentoService.DocumentoContenido contenido = documentoService.obtenerStream(documentoId, getClientIp(request));
        Resource resource = toResource(contenido.getPath());
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            mediaType = MediaType.parseMediaType(contenido.getContentType());
        } catch (Exception ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        ContentDisposition disposition = buildDisposition(true, contenido.getFilename());

        if (!headers.getRange().isEmpty()) {
            return buildRangeResponse(resource, headers, mediaType, disposition);
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .contentLength(resource.contentLength())
            .body(resource);
    }

    @DeleteMapping("/documentos/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable("id") Long documentoId, HttpServletRequest request) {
        documentoService.eliminar(documentoId, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.ok("Documento eliminado exitosamente", null));
    }

    @PostMapping("/documentos/{id}/impresion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    public ResponseEntity<ApiResponse<Void>> registrarImpresion(
        @PathVariable("id") Long documentoId,
        HttpServletRequest request
    ) {
        documentoService.registrarImpresion(documentoId, getClientIp(request));
        return ResponseEntity.ok(ApiResponse.ok("Impresión registrada", null));
    }

    private ResponseEntity<byte[]> buildRangeResponse(
        Resource resource,
        HttpHeaders requestHeaders,
        MediaType mediaType,
        ContentDisposition disposition
    ) throws IOException {
        long contentLength = resource.contentLength();
        HttpRange range = requestHeaders.getRange().get(0);
        long start = range.getRangeStart(contentLength);
        long end = range.getRangeEnd(contentLength);
        long rangeLength = end - start + 1;
        byte[] data = readRange(resource, start, rangeLength);

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setContentType(mediaType);
        responseHeaders.setContentLength(rangeLength);
        responseHeaders.set(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + contentLength);
        responseHeaders.set(HttpHeaders.CONTENT_DISPOSITION, disposition.toString());
        return new ResponseEntity<>(data, responseHeaders, HttpStatus.PARTIAL_CONTENT);
    }

    private byte[] readRange(Resource resource, long start, long length) throws IOException {
        try (InputStream input = resource.getInputStream()) {
            long skipped = 0;
            while (skipped < start) {
                long skip = input.skip(start - skipped);
                if (skip <= 0) {
                    break;
                }
                skipped += skip;
            }
            return input.readNBytes((int) length);
        }
    }

    private Resource toResource(Path path) throws IOException {
        UrlResource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new IOException("Recurso no disponible");
        }
        return resource;
    }

    private ContentDisposition buildDisposition(boolean inline, String filename) {
        ContentDisposition.Builder builder = inline ? ContentDisposition.inline() : ContentDisposition.attachment();
        return builder.filename(filename).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader(HEADER_IP);
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
