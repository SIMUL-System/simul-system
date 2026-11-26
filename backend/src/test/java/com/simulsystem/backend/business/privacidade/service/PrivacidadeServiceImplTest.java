package com.simulsystem.backend.business.privacidade.service;

import com.simulsystem.backend.business.notificacao.repository.HistoricoNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.business.privacidade.dto.MeusDadosResponseDTO;
import com.simulsystem.backend.business.usuario.model.PerfilUsuario;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenRecuperacaoSenhaRepository;
import com.simulsystem.backend.business.usuario.repository.TokenVerificacaoEmailRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import com.simulsystem.backend.core.exception.ExclusaoNaoPermitidaException;
import com.simulsystem.backend.core.exception.SenhaIncorretaException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrivacidadeServiceImplTest {

    private static final String EMAIL = "morador@simul.local";

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PreferenciaNotificacaoRepository preferenciaRepository;

    @Mock
    private PushSubscriptionRepository pushSubscriptionRepository;

    @Mock
    private HistoricoNotificacaoRepository historicoRepository;

    @Mock
    private TokenVerificacaoEmailRepository tokenVerificacaoRepository;

    @Mock
    private TokenRecuperacaoSenhaRepository tokenRecuperacaoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private final Clock clock = Clock.fixed(Instant.parse("2026-11-26T12:00:00Z"), ZoneId.of("America/Sao_Paulo"));

    private PrivacidadeServiceImpl service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = new PrivacidadeServiceImpl(
                usuarioService,
                usuarioRepository,
                preferenciaRepository,
                pushSubscriptionRepository,
                historicoRepository,
                tokenVerificacaoRepository,
                tokenRecuperacaoRepository,
                passwordEncoder,
                clock
        );

        usuario = new Usuario();
        usuario.setId(5L);
        usuario.setNome("Morador");
        usuario.setEmail(EMAIL);
        usuario.setSenha("hash");
        usuario.setPerfil(PerfilUsuario.USUARIO);
        usuario.setEmailVerificado(true);

        when(usuarioService.buscarEntidadePorEmail(EMAIL)).thenReturn(usuario);
    }

    @Test
    void deveExcluirTudoDoUsuarioQuandoASenhaEstaCerta() {
        when(passwordEncoder.matches("senha-certa", "hash")).thenReturn(true);

        service.excluirConta(EMAIL, "senha-certa");

        InOrder ordem = inOrder(historicoRepository, preferenciaRepository, pushSubscriptionRepository,
                tokenVerificacaoRepository, tokenRecuperacaoRepository, usuarioRepository);
        ordem.verify(historicoRepository).deleteByUsuarioId(5L);
        ordem.verify(preferenciaRepository).deleteByUsuarioId(5L);
        ordem.verify(pushSubscriptionRepository).deleteByUsuarioId(5L);
        ordem.verify(tokenVerificacaoRepository).deleteByUsuarioId(5L);
        ordem.verify(tokenRecuperacaoRepository).deleteByUsuarioId(5L);
        ordem.verify(usuarioRepository).delete(usuario);
    }

    @Test
    void naoDeveExcluirComSenhaErrada() {
        when(passwordEncoder.matches("errada", "hash")).thenReturn(false);

        assertThrows(SenhaIncorretaException.class, () -> service.excluirConta(EMAIL, "errada"));

        verify(historicoRepository, never()).deleteByUsuarioId(anyLong());
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void naoDeveExcluirContaDeAdministrador() {
        usuario.setPerfil(PerfilUsuario.ADMIN);

        assertThrows(ExclusaoNaoPermitidaException.class, () -> service.excluirConta(EMAIL, "qualquer"));

        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void deveExportarOsDadosDaConta() {
        when(preferenciaRepository.findByUsuarioId(5L)).thenReturn(Optional.empty());
        when(pushSubscriptionRepository.findByUsuarioId(5L)).thenReturn(List.of());
        when(historicoRepository.findTop200ByUsuarioIdOrderByDataHoraColetaDesc(5L)).thenReturn(List.of());

        MeusDadosResponseDTO dados = service.exportarDados(EMAIL);

        assertEquals("Morador", dados.conta().nome());
        assertEquals(EMAIL, dados.conta().email());
        assertNull(dados.preferencia());
        assertEquals(LocalDateTime.of(2026, 11, 26, 9, 0), dados.geradoEm());
    }

    @Test
    void deveRegistrarOAceiteDosTermos() {
        service.registrarAceiteTermos(EMAIL, " 2026-11 ");

        assertEquals("2026-11", usuario.getTermosVersao());
        assertEquals(LocalDateTime.of(2026, 11, 26, 9, 0), usuario.getTermosAceitosEm());
        verify(usuarioRepository).save(usuario);
    }
}
