package com.oj.sged.api.controller;

import com.oj.sged.api.dto.request.ActualizarUsuarioRequest;
import com.oj.sged.api.dto.request.CrearUsuarioRequest;
import com.oj.sged.api.dto.request.ResetPasswordRequest;
import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.UsuarioAdminResponse;
import com.oj.sged.application.service.AdminUsuarioService;
import java.util.Objects;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para administración de usuarios (HU-016 y HU-017).
 * Endpoints protegidos para ADMINISTRADOR.
 */
@RestController
@RequestMapping("/api/v1/admin/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminUsuariosController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuariosController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    /**
     * GET /api/v1/admin/usuarios
     * Lista usuarios con filtros opcionalesapaginación.
     *
     * Query params:
     * - rolId: Long (opcional)
     * - juzgadoId: Long (opcional)
     * - activo: Boolean (opcional)
     * - bloqueado: Boolean (opcional)
     * - username: String (opcional, búsqueda por contiene)
     * - page: int (default 0)
     * - size: int (default 20)
     * - sort: String (default "id,asc")
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UsuarioAdminResponse>>> listarUsuarios(
        @RequestParam(required = false) Long rolId,
        @RequestParam(required = false) Long juzgadoId,
        @RequestParam(required = false) Boolean activo,
        @RequestParam(required = false) Boolean bloqueado,
        @RequestParam(required = false) String username,
        Pageable pageable
    ) {
        Page<UsuarioAdminResponse> resultado = adminUsuarioService.listarUsuarios(
            rolId,
            juzgadoId,
            activo,
            bloqueado,
            username,
            Objects.requireNonNull(pageable)
        );
        return ResponseEntity.ok(ApiResponse.ok("Usuarios listados correctamente", resultado));
    }

    /**
     * POST /api/v1/admin/usuarios
     * Crea un nuevo usuario.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> crearUsuario(
        @Valid @RequestBody CrearUsuarioRequest request
    ) {
        UsuarioAdminResponse resultado = adminUsuarioService.crearUsuario(Objects.requireNonNull(request));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Usuario creado correctamente", resultado));
    }

    /**
     * GET /api/v1/admin/usuarios/{id}
     * Obtiene el detalle de un usuario específico.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> obtenerUsuario(
        @PathVariable Long id
    ) {
        UsuarioAdminResponse resultado = adminUsuarioService.obtenerUsuario(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.ok("Usuario obtenido correctamente", resultado));
    }

    /**
     * PUT /api/v1/admin/usuarios/{id}
     * Actualiza datos de un usuario (nombre, email, rol, juzgado, estado).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> actualizarUsuario(
        @PathVariable Long id,
        @Valid @RequestBody ActualizarUsuarioRequest request
    ) {
        UsuarioAdminResponse resultado = adminUsuarioService.actualizarUsuario(Objects.requireNonNull(id), Objects.requireNonNull(request));
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado correctamente", resultado));
    }

    /**
     * POST /api/v1/admin/usuarios/{id}/reset-password
     * Resetea la contraseña de un usuario.
     * Genera contraseña temporal y marca debeCambiarPass = true.
     */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
        @PathVariable Long id,
        @RequestBody(required = false) ResetPasswordRequest request
    ) {
        adminUsuarioService.resetPassword(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.ok("Contraseña reseteada correctamente", null));
    }

    /**
     * POST /api/v1/admin/usuarios/{id}/bloquear
     * Bloquea un usuario (impide login).
     */
    @PostMapping("/{id}/bloquear")
    public ResponseEntity<ApiResponse<Void>> bloquearUsuario(
        @PathVariable Long id
    ) {
        adminUsuarioService.bloquearUsuario(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.ok("Usuario bloqueado correctamente", null));
    }

    /**
     * POST /api/v1/admin/usuarios/{id}/desbloquear
     * Desbloquea un usuario (permite login nuevamente).
     */
    @PostMapping("/{id}/desbloquear")
    public ResponseEntity<ApiResponse<Void>> desbloquearUsuario(
        @PathVariable Long id
    ) {
        adminUsuarioService.desbloquearUsuario(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.ok("Usuario desbloqueado correctamente", null));
    }
}
