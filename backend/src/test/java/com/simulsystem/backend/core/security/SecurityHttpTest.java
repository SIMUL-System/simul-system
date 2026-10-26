package com.simulsystem.backend.core.security;

import com.simulsystem.backend.business.rota.controller.ConsultaRotaController;
import com.simulsystem.backend.business.rota.service.RotaService;
import com.simulsystem.backend.business.usuario.controller.AdminUsuarioController;
import com.simulsystem.backend.business.usuario.controller.UsuarioController;
import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.model.PerfilUsuario;
import com.simulsystem.backend.business.usuario.service.RecuperacaoSenhaService;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import com.simulsystem.backend.business.usuario.service.VerificacaoEmailService;

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
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        ConsultaRotaController.class,
        UsuarioController.class,
        AdminUsuarioController.class
})
@Import({
        SecurityConfig.class,
        JwtAuthenticationEntryPoint.class,
        JwtAccessDeniedHandler.class
})
class SecurityHttpTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RotaService rotaService;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private VerificacaoEmailService verificacaoEmailService;

    @MockitoBean
    private RecuperacaoSenhaService recuperacaoSenhaService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void devePermitirConsultaPublicaSemToken() throws Exception {
        String cidade = "Senador Canedo";
        String bairro = "Jardim Nova Goiânia";

        mockMvc.perform(get("/api/rotas/consulta")
                        .param("cidade", cidade)
                        .param("bairro", bairro))
                .andExpect(status().isOk());

        verify(rotaService).consultarPorCidadeEBairro(cidade, bairro);
    }

    @Test
    void devePermitirCadastroSemToken() throws Exception {
        LocalDateTime agora = LocalDateTime.now();
        UsuarioResponseDTO resposta = new UsuarioResponseDTO(
                1L,
                "Novo Usuario",
                "novo@simul.local",
                PerfilUsuario.USUARIO,
                true,
                false,
                agora,
                agora
        );

        when(usuarioService.cadastrar(any(UsuarioRequestDTO.class)))
                .thenReturn(resposta);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Novo Usuario",
                                  "email": "novo@simul.local",
                                  "senha": "SenhaSegura123!"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("novo@simul.local"))
                .andExpect(jsonPath("$.perfil").value("USUARIO"));

        verify(usuarioService).cadastrar(any(UsuarioRequestDTO.class));
    }

    @Test
    void deveRetornar401AoAcessarEndpointProtegidoSemToken() throws Exception {
        mockMvc.perform(get("/api/usuarios/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Não autorizado"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value(
                        "Autenticação necessária ou token inválido."))
                .andExpect(jsonPath("$.instance").value("/api/usuarios/me"));
    }

    @Test
    void deveBloquearUsuarioComumEmEndpointAdmin() throws Exception {
        when(jwtDecoder.decode("token-usuario"))
                .thenReturn(criarJwt(
                        "token-usuario",
                        "usuario@simul.local",
                        "USUARIO"));

        mockMvc.perform(get("/api/admin/usuarios/verificar-acesso")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token-usuario"))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Acesso negado"))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.detail").value(
                        "Você não possui permissão para acessar este recurso."))
                .andExpect(jsonPath("$.instance").value(
                        "/api/admin/usuarios/verificar-acesso"));
    }

    @Test
    void devePermitirAdminEmEndpointAdmin() throws Exception {
        when(jwtDecoder.decode("token-admin"))
                .thenReturn(criarJwt(
                        "token-admin",
                        "admin@simul.local",
                        "ADMIN"));

        mockMvc.perform(get("/api/admin/usuarios/verificar-acesso")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token-admin"))
                .andExpect(status().isNoContent());
    }

    private Jwt criarJwt(String token, String email, String perfil) {
        Instant agora = Instant.now();

        return Jwt.withTokenValue(token)
                .header("alg", "HS256")
                .subject(email)
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(3600))
                .claim("roles", List.of(perfil))
                .build();
    }
}
