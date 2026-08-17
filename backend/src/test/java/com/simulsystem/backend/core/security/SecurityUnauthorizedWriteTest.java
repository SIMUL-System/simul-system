package com.simulsystem.backend.core.security;

import com.simulsystem.backend.business.cronograma.controller.CronogramaController;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.controller.RotaController;
import com.simulsystem.backend.business.rota.service.RotaService;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = {
                RotaController.class,
                CronogramaController.class
        }
)
@Import({
        SecurityConfig.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class
})
class SecurityUnauthorizedWriteTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RotaService rotaService;

    @MockitoBean
    private CronogramaService cronogramaService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void visitanteNaoDeveListarRotasAdministrativas()
            throws Exception {

        mockMvc.perform(
                        get("/api/admin/rotas")
                )
                .andExpect(
                        status().isUnauthorized()
                );

        verifyNoInteractions(
                rotaService
        );
    }

    @Test
    void visitanteNaoDeveCadastrarRota()
            throws Exception {

        mockMvc.perform(
                        post("/api/admin/rotas")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "nome": "Rota não autorizada"
                                        }
                                        """)
                )
                .andExpect(
                        status().isUnauthorized()
                );

        verifyNoInteractions(
                rotaService
        );
    }

    @Test
    void usuarioComumNaoDeveAlterarRota()
            throws Exception {

        configurarUsuarioComum();

        mockMvc.perform(
                        patch(
                                "/api/admin/rotas/1/status"
                        )
                                .param(
                                        "ativo",
                                        "false"
                                )
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer token-usuario"
                                )
                )
                .andExpect(
                        status().isForbidden()
                );

        verifyNoInteractions(
                rotaService
        );
    }

    @Test
    void usuarioComumNaoDeveCadastrarRota()
            throws Exception {

        configurarUsuarioComum();

        mockMvc.perform(
                        post("/api/admin/rotas")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer token-usuario"
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "nome": "Rota invasor"
                                        }
                                        """)
                )
                .andExpect(
                        status().isForbidden()
                );

        verifyNoInteractions(
                rotaService
        );
    }

    @Test
void usuarioComumNaoDeveCadastrarCronograma()
        throws Exception {

    configurarUsuarioComum();

    mockMvc.perform(
                    post(
                            "/api/admin/cronogramas"
                    )
                            .header(
                                    HttpHeaders.AUTHORIZATION,
                                    "Bearer token-usuario"
                            )
                            .contentType(
                                    MediaType.APPLICATION_JSON
                            )
                            .content("""
                                    {
                                      "rotaId": 1,
                                      "diaSemana": "SEGUNDA",
                                      "horarioInicio": "19:00:00",
                                      "horarioFim": "01:00:00"
                                    }
                                    """)
            )
            .andExpect(
                    status().isForbidden()
            );

    verifyNoInteractions(
            cronogramaService
    );
}

    @Test
    void usuarioComumNaoDeveAlterarStatusCronograma()
            throws Exception {

        configurarUsuarioComum();

        mockMvc.perform(
                        patch(
                                "/api/admin/cronogramas/1/status"
                        )
                                .param(
                                        "ativo",
                                        "false"
                                )
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer token-usuario"
                                )
                )
                .andExpect(
                        status().isForbidden()
                );

        verifyNoInteractions(
                cronogramaService
        );
    }

    private void configurarUsuarioComum() {

        when(
                jwtDecoder.decode(
                        "token-usuario"
                )
        ).thenReturn(
                criarJwtUsuario()
        );
    }

    private Jwt criarJwtUsuario() {

        Instant agora =
                Instant.now();

        return Jwt
                .withTokenValue(
                        "token-usuario"
                )
                .header(
                        "alg",
                        "HS256"
                )
                .subject(
                        "usuario@simul.local"
                )
                .issuedAt(
                        agora
                )
                .expiresAt(
                        agora.plusSeconds(
                                3600
                        )
                )
                .claim(
                        "roles",
                        List.of(
                                "USUARIO"
                        )
                )
                .build();
    }
}