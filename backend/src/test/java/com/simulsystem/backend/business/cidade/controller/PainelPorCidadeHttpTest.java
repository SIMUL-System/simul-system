package com.simulsystem.backend.business.cidade.controller;

import com.simulsystem.backend.business.cidade.dto.CidadeResponseDTO;
import com.simulsystem.backend.business.cidade.service.CidadeService;
import com.simulsystem.backend.business.cronograma.controller.CronogramaController;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.controller.RotaController;
import com.simulsystem.backend.business.rota.service.RotaService;
import com.simulsystem.backend.core.exception.CidadeDivergenteException;
import com.simulsystem.backend.core.security.JwtAccessDeniedHandler;
import com.simulsystem.backend.core.security.JwtAuthenticationEntryPoint;
import com.simulsystem.backend.core.security.SecurityConfig;

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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Painel admin por cidade: acesso, filtro por cidade e erro de cidade diferente. */
@WebMvcTest(controllers = {CidadeController.class, RotaController.class, CronogramaController.class})
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, JwtAccessDeniedHandler.class})
class PainelPorCidadeHttpTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CidadeService cidadeService;

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
    void visitanteNaoDeveVerAsCidadesDoPainel() throws Exception {
        mockMvc.perform(get("/api/admin/cidades")).andExpect(status().isUnauthorized());

        verifyNoInteractions(cidadeService);
    }

    @Test
    void usuarioComumNaoDeveVerAsCidadesDoPainel() throws Exception {
        when(jwtDecoder.decode("token")).thenReturn(jwt("USUARIO"));

        mockMvc.perform(get("/api/admin/cidades").header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(cidadeService);
    }

    @Test
    void adminDeveVerIndicadoresDeCadaCidade() throws Exception {
        when(jwtDecoder.decode("token")).thenReturn(jwt("ADMIN"));
        when(cidadeService.listarComIndicadores()).thenReturn(List.of(
                new CidadeResponseDTO(2L, "Goiânia", "GO", "Comurg", 18, 18, 492, 492, 30, 30, 0, 0, 0)));

        mockMvc.perform(get("/api/admin/cidades").header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Goiânia"))
                .andExpect(jsonPath("$[0].bairros").value(492))
                .andExpect(jsonPath("$[0].coletasSemHorario").value(30));
    }

    @Test
    void adminDeveListarRotasEColetasSoDaCidadeEscolhida() throws Exception {
        when(jwtDecoder.decode("token")).thenReturn(jwt("ADMIN"));

        mockMvc.perform(get("/api/admin/rotas").param("cidadeId", "3")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/rotas/areas").param("cidadeId", "3")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/cronogramas").param("cidadeId", "3")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andExpect(status().isOk());

        verify(rotaService).listarRotas(3L);
        verify(rotaService).listarAreasAtendidas(3L);
        verify(cronogramaService).listar(3L);
    }

    @Test
    void bairroDeOutraCidadeDeveVoltarComoConflito() throws Exception {
        when(jwtDecoder.decode("token")).thenReturn(jwt("ADMIN"));
        when(rotaService.adicionarBairrosNaRota(eq(1L), any()))
                .thenThrow(new CidadeDivergenteException("A rota escolhida é de Senador Canedo."));

        mockMvc.perform(put("/api/admin/rotas/1/bairros")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "cidade": "Goiânia", "bairros": ["Setor Bueno"] }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("A rota escolhida é de Senador Canedo."));
    }

    private Jwt jwt(String perfil) {
        Instant agora = Instant.now();

        return Jwt.withTokenValue("token")
                .header("alg", "HS256")
                .subject(perfil.toLowerCase() + "@simul.local")
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(3600))
                .claim("roles", List.of(perfil))
                .build();
    }
}
