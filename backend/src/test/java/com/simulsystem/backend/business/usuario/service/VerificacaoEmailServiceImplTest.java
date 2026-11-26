package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.notificacao.strategy.EmailNotificacaoStrategy;
import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailResponseDTO;
import com.simulsystem.backend.business.usuario.model.TokenVerificacaoEmail;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenVerificacaoEmailRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import com.simulsystem.backend.core.config.LinkFrontend;
import com.simulsystem.backend.core.security.CriptografiaDados;
import com.simulsystem.backend.core.security.TokenSeguro;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificacaoEmailServiceImplTest {

    private static final String TOKEN = "token-do-link";

    @Mock
    private TokenVerificacaoEmailRepository tokenRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmailNotificacaoStrategy emailNotificacaoStrategy;

    private final TokenSeguro tokenSeguro = new TokenSeguro();

    private VerificacaoEmailServiceImpl service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-24T15:00:00Z"), ZoneId.of("America/Sao_Paulo"));

        service = new VerificacaoEmailServiceImpl(
                tokenRepository,
                usuarioRepository,
                new UsuarioValidation(usuarioRepository, new CriptografiaDados("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")),
                emailNotificacaoStrategy,
                tokenSeguro,
                new LinkFrontend("http://localhost:5173"),
                clock,
                24,
                new CriptografiaDados("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="));
    }

    @Test
    void deveConfirmarEmailNaPrimeiraVez() {
        TokenVerificacaoEmail token = criarToken(false, false);
        when(tokenRepository.findByTokenHash(tokenSeguro.hash(TOKEN))).thenReturn(Optional.of(token));

        VerificacaoEmailResponseDTO resposta = service.verificarEmail(TOKEN);

        assertTrue(resposta.verificado());
        assertEquals("E-mail confirmado com sucesso.", resposta.mensagem());
        assertTrue(token.getUsuario().getEmailVerificado());
        assertTrue(token.getUtilizado());
        verify(usuarioRepository).save(token.getUsuario());
    }

    @Test
    void deveResponderSucessoQuandoOMesmoLinkForAbertoDeNovo() {
        // Recarregar a página ou o React repetir o pedido não pode mostrar erro.
        TokenVerificacaoEmail token = criarToken(true, true);
        when(tokenRepository.findByTokenHash(tokenSeguro.hash(TOKEN))).thenReturn(Optional.of(token));

        VerificacaoEmailResponseDTO resposta = service.verificarEmail(TOKEN);

        assertTrue(resposta.verificado());
        assertEquals("Este e-mail já está confirmado.", resposta.mensagem());
        verify(usuarioRepository, never()).save(any());
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void deveRecusarLinkUsadoDeContaNaoConfirmada() {
        TokenVerificacaoEmail token = criarToken(true, false);
        when(tokenRepository.findByTokenHash(tokenSeguro.hash(TOKEN))).thenReturn(Optional.of(token));

        VerificacaoEmailResponseDTO resposta = service.verificarEmail(TOKEN);

        assertFalse(resposta.verificado());
    }

    @Test
    void deveRecusarLinkExpirado() {
        TokenVerificacaoEmail token = criarToken(false, false);
        token.setDataExpiracao(LocalDateTime.of(2026, 11, 24, 11, 59));
        when(tokenRepository.findByTokenHash(tokenSeguro.hash(TOKEN))).thenReturn(Optional.of(token));

        VerificacaoEmailResponseDTO resposta = service.verificarEmail(TOKEN);

        assertFalse(resposta.verificado());
        assertFalse(token.getUsuario().getEmailVerificado());
    }

    @Test
    void deveRecusarTokenInexistente() {
        when(tokenRepository.findByTokenHash(tokenSeguro.hash(TOKEN))).thenReturn(Optional.empty());

        assertFalse(service.verificarEmail(TOKEN).verificado());
    }

    private TokenVerificacaoEmail criarToken(boolean utilizado, boolean emailVerificado) {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmailVerificado(emailVerificado);

        TokenVerificacaoEmail token = new TokenVerificacaoEmail();
        token.setUsuario(usuario);
        token.setTokenHash(tokenSeguro.hash(TOKEN));
        token.setUtilizado(utilizado);
        token.setDataExpiracao(LocalDateTime.of(2026, 11, 25, 12, 0));
        return token;
    }
}
