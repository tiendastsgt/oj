package com.oj.sged.infrastructure.config;

import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DbDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DbDataInitializer.class);

    private final CatRolRepository rolRepository;
    private final CatJuzgadoRepository juzgadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DbDataInitializer(
        CatRolRepository rolRepository,
        CatJuzgadoRepository juzgadoRepository,
        UsuarioRepository usuarioRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.rolRepository = rolRepository;
        this.juzgadoRepository = juzgadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Iniciando semillado de datos para estabilización (Elite UX)...");

        // 1. Roles
        CatRol adminRol = ensureRol("ADMINISTRADOR", "Acceso total al sistema");
        CatRol secretarioRol = ensureRol("SECRETARIO", "Gestión de expedientes");
        CatRol juezRol = ensureRol("JUEZ", "Firma y resolución");
        CatRol consultaRol = ensureRol("CONSULTA", "Solo lectura");

        // 2. Juzgado General
        CatJuzgado juzgado = ensureJuzgado("JUZ-GEN-01", "Juzgado General de Pruebas");

        // 3. Usuarios QA
        String qaPassHash = passwordEncoder.encode("QAPassword123!");

        ensureUser("admin.qa", qaPassHash, "Administrador QA", "admin.qa@oj.gob.gt", adminRol, juzgado);
        ensureUser("secretario.qa", qaPassHash, "Secretario QA", "secretario.qa@oj.gob.gt", secretarioRol, juzgado);
        ensureUser("juez.qa", qaPassHash, "Juez QA", "juez.qa@oj.gob.gt", juezRol, juzgado);
        ensureUser("consulta.qa", qaPassHash, "Consulta QA", "consulta.qa@oj.gob.gt", consultaRol, juzgado);

        log.info("Semillado de datos completado exitosamente.");
    }

    private CatRol ensureRol(String nombre, String descripcion) {
        return rolRepository.findByNombre(nombre)
            .orElseGet(() -> {
                log.info("Creando rol faltante: {}", nombre);
                return rolRepository.save(CatRol.builder()
                    .nombre(nombre)
                    .descripcion(descripcion)
                    .activo(1)
                    .build());
            });
    }

    private CatJuzgado ensureJuzgado(String codigo, String nombre) {
        return juzgadoRepository.findByCodigo(codigo)
            .orElseGet(() -> {
                log.info("Creando juzgado faltante: {}", codigo);
                return juzgadoRepository.save(CatJuzgado.builder()
                    .codigo(codigo)
                    .nombre(nombre)
                    .activo(1)
                    .build());
            });
    }

    private void ensureUser(String username, String password, String nombre, String email, CatRol rol, CatJuzgado juzgado) {
        if (usuarioRepository.findByUsername(username).isEmpty()) {
            log.info("Creando usuario QA: {}", username);
            usuarioRepository.save(Usuario.builder()
                .username(username)
                .password(password)
                .nombreCompleto(nombre)
                .email(email)
                .rol(rol)
                .juzgado(juzgado)
                .activo(1)
                .bloqueado(0)
                .intentosFallidos(0)
                .debeCambiarPass(0)
                .fechaCreacion(LocalDateTime.now())
                .build());
        }
    }
}
