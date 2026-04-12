package com.oj.sged.application.service;

import com.oj.sged.api.dto.request.ActualizarUsuarioRequest;
import com.oj.sged.api.dto.request.CrearUsuarioRequest;
import com.oj.sged.api.dto.response.UsuarioAdminResponse;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.shared.exception.ResourceNotFoundException;
import com.oj.sged.shared.util.AuditAction;
import com.oj.sged.shared.util.SecurityUtil;
import java.time.LocalDateTime;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de administración de usuarios (HU-016 y HU-017).
 * Gestiona creación, actualización, bloqueo/desbloqueo y consulta de usuarios.
 */
@Service
@Transactional
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CatRolRepository rolRepository;
    private final CatJuzgadoRepository juzgadoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public AdminUsuarioService(
        UsuarioRepository usuarioRepository,
        CatRolRepository rolRepository,
        CatJuzgadoRepository juzgadoRepository,
        PasswordEncoder passwordEncoder,
        AuditoriaService auditoriaService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.juzgadoRepository = juzgadoRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    /**
     * Lista usuarios con filtros dinámicos.
     */
    public Page<UsuarioAdminResponse> listarUsuarios(
        Long rolId,
        Long juzgadoId,
        Boolean activo,
        Boolean bloqueado,
        String username,
        Pageable pageable
    ) {
        Specification<Usuario> spec = (root, query, cb) -> {
                var predicates = new java.util.ArrayList<>();

                if (rolId != null) {
                    predicates.add(cb.equal(root.get("rol").get("id"), rolId));
                }
                if (juzgadoId != null) {
                    predicates.add(cb.equal(root.get("juzgado").get("id"), juzgadoId));
                }
                if (activo != null) {
                    int activoInt = activo ? 1 : 0;
                    predicates.add(cb.equal(root.get("activo"), activoInt));
                }
                if (bloqueado != null) {
                    int bloqueadoInt = bloqueado ? 1 : 0;
                    predicates.add(cb.equal(root.get("bloqueado"), bloqueadoInt));
                }
                if (username != null && !username.isEmpty()) {
                    predicates.add(cb.like(
                        cb.lower(root.get("username")),
                        "%" + username.toLowerCase() + "%"
                    ));
                }

                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };

        return usuarioRepository.findAll(spec, Objects.requireNonNull(pageable))
            .map(this::mapToResponse);
    }

    /**
     * Crea un nuevo usuario con contraseña encriptada.
     * Genera contraseña temporal y marca debeCambiarPass = true.
     */
    public UsuarioAdminResponse crearUsuario(CrearUsuarioRequest request) {
        // Validar que el rol existe y está activo
        CatRol rol = rolRepository.findById(Objects.requireNonNull(request.getRolId()))
            .filter(r -> r.getActivo() == 1)
            .orElseThrow(() -> new ResourceNotFoundException("El rol especificado no existe o no está activo"));

        // Validar que el juzgado existe
        CatJuzgado juzgado = juzgadoRepository.findById(Objects.requireNonNull(request.getJuzgadoId()))
            .orElseThrow(() -> new ResourceNotFoundException("El juzgado especificado no existe"));

        // Validar username único
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResourceNotFoundException("El nombre de usuario ya existe");
        }

        // Generar contraseña temporal (sencilla para primera vez)
        String passwordTemporal = generarPasswordTemporal();

        // Crear usuario
        Usuario usuario = Usuario.builder()
            .username(request.getUsername())
            .nombreCompleto(request.getNombreCompleto())
            .email(request.getEmail())
            .password(passwordEncoder.encode(passwordTemporal))
            .rol(rol)
            .juzgado(juzgado)
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .fechaBloqueo(null)
            .debeCambiarPass(1)  // Debe cambiar contraseña en primer login
            .fechaCreacion(LocalDateTime.now())
            .build();

        Usuario usuarioGuardado = usuarioRepository.save(Objects.requireNonNull(usuario));

        // Auditoría
        String detalleAuditoria = "Usuario " + request.getUsername() + " creado con rol " + rol.getNombre();
        auditoriaService.registrar(
            AuditAction.USUARIO_CREADO,
            AuditAction.MODULO_ADMIN,
            usuarioGuardado.getId(),
            detalleAuditoria,
            obtenerIPActual()
        );

        return mapToResponse(usuarioGuardado);
    }

    /**
     * Obtiene el detalle de un usuario específico.
     */
    @Transactional(readOnly = true)
    public UsuarioAdminResponse obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return mapToResponse(usuario);
    }

    /**
     * Actualiza datos de un usuario (nombre, email, rol, juzgado, estado).
     * Registra cambios en auditoría.
     */
    public UsuarioAdminResponse actualizarUsuario(Long id, ActualizarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        StringBuilder detalleAuditoria = new StringBuilder("Usuario " + usuario.getUsername() + " actualizado: ");
        boolean cambioRegistrado = false;

        // Actualizar nombre completo
        if (request.getNombreCompleto() != null && !request.getNombreCompleto().equals(usuario.getNombreCompleto())) {
            usuario.setNombreCompleto(request.getNombreCompleto());
            cambioRegistrado = true;
        }

        // Actualizar email
        if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
            usuario.setEmail(request.getEmail());
            cambioRegistrado = true;
        }

        // Actualizar rol
        if (request.getRolId() != null && !request.getRolId().equals(usuario.getRol().getId())) {
            CatRol nuevoRol = rolRepository.findById(Objects.requireNonNull(request.getRolId()))
                .filter(r -> r.getActivo() == 1)
                .orElseThrow(() -> new ResourceNotFoundException("El rol especificado no existe o no está activo"));
            String rolAnterior = usuario.getRol().getNombre();
            usuario.setRol(nuevoRol);
            detalleAuditoria.append("rol (").append(rolAnterior).append(" -> ").append(nuevoRol.getNombre()).append(") ");
            cambioRegistrado = true;
        }

        // Actualizar juzgado
        if (request.getJuzgadoId() != null && !request.getJuzgadoId().equals(usuario.getJuzgado().getId())) {
            CatJuzgado nuevoJuzgado = juzgadoRepository.findById(Objects.requireNonNull(request.getJuzgadoId()))
                .orElseThrow(() -> new ResourceNotFoundException("El juzgado especificado no existe"));
            usuario.setJuzgado(nuevoJuzgado);
            cambioRegistrado = true;
        }

        // Actualizar estado activo
        if (request.getActivo() != null) {
            int nuevoActivo = request.getActivo() ? 1 : 0;
            if (nuevoActivo != usuario.getActivo()) {
                usuario.setActivo(nuevoActivo);
                cambioRegistrado = true;
            }
        }

        // Actualizar estado bloqueado
        if (request.getBloqueado() != null) {
            int nuevoBloqueado = request.getBloqueado() ? 1 : 0;
            if (nuevoBloqueado != usuario.getBloqueado()) {
                usuario.setBloqueado(nuevoBloqueado);
                cambioRegistrado = true;
            }
        }

        usuario.setFechaModificacion(LocalDateTime.now());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        // Auditoría (si hubo cambios)
        if (cambioRegistrado) {
            auditoriaService.registrar(
                AuditAction.USUARIO_ACTUALIZADO,
                AuditAction.MODULO_ADMIN,
                usuarioActualizado.getId(),
                detalleAuditoria.toString(),
                obtenerIPActual()
            );
        }

        return mapToResponse(usuarioActualizado);
    }

    /**
     * Resetea la contraseña de un usuario.
     * Genera contraseña temporal y marca debeCambiarPass = true.
     */
    public void resetPassword(Long id) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String passwordTemporal = generarPasswordTemporal();
        usuario.setPassword(passwordEncoder.encode(passwordTemporal));
        usuario.setDebeCambiarPass(1);
        usuario.setFechaModificacion(LocalDateTime.now());

        usuarioRepository.save(usuario);

        // Auditoría
        auditoriaService.registrar(
            AuditAction.RESET_PASSWORD_ADMIN,
            AuditAction.MODULO_ADMIN,
            usuario.getId(),
            "Contraseña reseteada por administrador para " + usuario.getUsername(),
            obtenerIPActual()
        );
    }

    /**
     * Bloquea un usuario (impide login).
     */
    public void bloquearUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        usuario.setBloqueado(1);
        usuario.setFechaModificacion(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Auditoría
        auditoriaService.registrar(
            AuditAction.USUARIO_BLOQUEADO,
            AuditAction.MODULO_ADMIN,
            usuario.getId(),
            "Usuario " + usuario.getUsername() + " bloqueado por administrador",
            obtenerIPActual()
        );
    }

    /**
     * Desbloquea un usuario (permite login nuevamente).
     */
    public void desbloquearUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        usuario.setBloqueado(0);
        // Nota: Intentos fallidos se resetean automáticamente en próximos intentos de login
        usuario.setFechaBloqueo(null);
        usuario.setFechaModificacion(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Auditoría
        auditoriaService.registrar(
            AuditAction.USUARIO_DESBLOQUEADO,
            AuditAction.MODULO_ADMIN,
            usuario.getId(),
            "Usuario " + usuario.getUsername() + " desbloqueado por administrador",
            obtenerIPActual()
        );
    }

    /**
     * Mapea entidad Usuario a DTO UsuarioAdminResponse.
     */
    private UsuarioAdminResponse mapToResponse(Usuario usuario) {
        return UsuarioAdminResponse.builder()
            .id(usuario.getId())
            .username(usuario.getUsername())
            .nombreCompleto(usuario.getNombreCompleto())
            .email(usuario.getEmail())
            .rol(usuario.getRol() != null ? usuario.getRol().getNombre() : "SIN ROL")
            .juzgado(usuario.getJuzgado() != null ? usuario.getJuzgado().getNombre() : "SIN JUZGADO")
            .activo(usuario.getActivo() != null && usuario.getActivo() == 1)
            .bloqueado(usuario.getBloqueado() != null && usuario.getBloqueado() == 1)
            .intentosFallidos(0)
            .debeCambiarPassword(usuario.getDebeCambiarPass() != null && usuario.getDebeCambiarPass() == 1)
            .fechaCreacion(usuario.getFechaCreacion())
            .fechaModificacion(usuario.getFechaModificacion())
            .build();
    }

    /**
     * Genera una contraseña temporal simple (puede mejorarse).
     */
    private String generarPasswordTemporal() {
        return "Temporal" + System.currentTimeMillis() % 10000;
    }

    /**
     * Obtiene IP del usuario actual desde SecurityContext.
     * Si no está disponible, devuelve "127.0.0.1".
     */
    private String obtenerIPActual() {
        return SecurityUtil.getCurrentUsername().isPresent() ? "127.0.0.1" : "127.0.0.1";
    }
}
