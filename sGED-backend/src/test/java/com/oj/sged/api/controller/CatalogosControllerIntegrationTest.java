package com.oj.sged.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oj.sged.config.AsyncTestConfig;
import com.oj.sged.infrastructure.persistence.auth.CatJuzgado;
import com.oj.sged.infrastructure.persistence.auth.CatRol;
import com.oj.sged.infrastructure.persistence.auth.Usuario;
import com.oj.sged.infrastructure.persistence.auth.repository.AuthAttemptRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.CatRolRepository;
import com.oj.sged.infrastructure.persistence.auth.repository.UsuarioRepository;
import com.oj.sged.infrastructure.persistence.expediente.CatEstado;
import com.oj.sged.infrastructure.persistence.expediente.CatTipoProceso;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import com.oj.sged.infrastructure.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AsyncTestConfig.class)
class CatalogosControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private CatTipoProcesoRepository catTipoProcesoRepository;
    @Autowired
    private CatEstadoRepository catEstadoRepository;
    @Autowired
    private CatJuzgadoRepository catJuzgadoRepository;
    @Autowired
    private CatRolRepository catRolRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AuthAttemptRepository authAttemptRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String token;

    @BeforeEach
    void setUp() {
        authAttemptRepository.deleteAll();
        usuarioRepository.deleteAll();
        catRolRepository.deleteAll();
        catJuzgadoRepository.deleteAll();
        catTipoProcesoRepository.deleteAll();
        catEstadoRepository.deleteAll();

        CatRol rol = catRolRepository.save(CatRol.builder()
            .nombre("ADMINISTRADOR")
            .descripcion("Administrador")
            .activo(1)
            .build());
        catTipoProcesoRepository.save(CatTipoProceso.builder()
            .nombre("Proceso Civil")
            .descripcion("Proceso civil")
            .activo(1)
            .build());
        catEstadoRepository.save(CatEstado.builder()
            .nombre("Activo")
            .descripcion("Expediente activo")
            .activo(1)
            .build());

        List<CatJuzgado> juzgados = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            juzgados.add(CatJuzgado.builder()
                .codigo("JZ-00" + i)
                .nombre("Juzgado " + i)
                .activo(1)
                .build());
        }
        List<CatJuzgado> savedJuzgados = catJuzgadoRepository.saveAll(juzgados);

        Usuario usuario = Usuario.builder()
            .username("admin")
            .password(passwordEncoder.encode("Password1"))
            .nombreCompleto("Admin")
            .email("admin@oj.local")
            .rol(rol)
            .juzgado(savedJuzgados.get(0))
            .activo(1)
            .bloqueado(0)
            .intentosFallidos(0)
            .debeCambiarPass(0)
            .fechaCreacion(LocalDateTime.now())
            .build();
        usuarioRepository.save(usuario);
        token = jwtTokenProvider.generateToken(usuario);
    }

    @Test
    void listarTiposProceso_returnsItems() throws Exception {
        mockMvc.perform(get("/api/v1/catalogos/tipos-proceso")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void listarEstadosExpediente_returnsItems() throws Exception {
        mockMvc.perform(get("/api/v1/catalogos/estados-expediente")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void listarJuzgados_returnsSix() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/catalogos/juzgados")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        int count = root.path("data").size();
        assertThat(count).isEqualTo(6);
    }
}
