package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.mapper.PreferenciaNotificacaoMapper;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.validation.PreferenciaNotificacaoValidation;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PreferenciaNotificacaoServiceImplTest {

    @Mock
    private PreferenciaNotificacaoRepository repository;

    @Mock
    private PreferenciaNotificacaoMapper mapper;

    @Mock
    private PreferenciaNotificacaoValidation validation;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private RotaValidation rotaValidation;

    private PreferenciaNotificacaoServiceImpl service;

    @BeforeEach
    void setUp() {
        service =
                new PreferenciaNotificacaoServiceImpl(
                        repository,
                        mapper,
                        validation,
                        usuarioService,
                        rotaValidation
                );
    }

    @Test
    void devePermitirEmailQuandoUsuarioRotaEPreferenciaEstiveremAtivos() {
        PreferenciaNotificacao preferencia =
                criarPreferencia(
                        3L,
                        true,
                        1L,
                        true,
                        true
                );

        when(repository.findByUsuarioId(3L))
                .thenReturn(Optional.of(preferencia));

        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        1L
                );

        assertTrue(resultado);

        verify(repository)
                .findByUsuarioId(3L);
    }

    @Test
    void naoDevePermitirEmailQuandoUsuarioEstiverInativo() {
        PreferenciaNotificacao preferencia =
                criarPreferencia(
                        3L,
                        false,
                        1L,
                        true,
                        true
                );

        when(repository.findByUsuarioId(3L))
                .thenReturn(Optional.of(preferencia));

        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        1L
                );

        assertFalse(resultado);
    }

    @Test
    void naoDevePermitirEmailQuandoRotaEstiverInativa() {
        PreferenciaNotificacao preferencia =
                criarPreferencia(
                        3L,
                        true,
                        1L,
                        false,
                        true
                );

        when(repository.findByUsuarioId(3L))
                .thenReturn(Optional.of(preferencia));

        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        1L
                );

        assertFalse(resultado);
    }

    @Test
    void naoDevePermitirEmailQuandoPreferenciaDeEmailEstiverDesativada() {
        PreferenciaNotificacao preferencia =
                criarPreferencia(
                        3L,
                        true,
                        1L,
                        true,
                        false
                );

        when(repository.findByUsuarioId(3L))
                .thenReturn(Optional.of(preferencia));

        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        1L
                );

        assertFalse(resultado);
    }

    @Test
    void naoDevePermitirEmailQuandoPreferenciaEstiverEmOutraRota() {
        PreferenciaNotificacao preferencia =
                criarPreferencia(
                        3L,
                        true,
                        2L,
                        true,
                        true
                );

        when(repository.findByUsuarioId(3L))
                .thenReturn(Optional.of(preferencia));

        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        1L
                );

        assertFalse(resultado);
    }

    @Test
    void naoDevePermitirEmailQuandoPreferenciaNaoExistir() {
        when(repository.findByUsuarioId(3L))
                .thenReturn(Optional.empty());

        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        1L
                );

        assertFalse(resultado);
    }

    @Test
    void naoDevePermitirEmailQuandoUsuarioIdForNulo() {
        boolean resultado =
                service.podeReceberEmail(
                        null,
                        1L
                );

        assertFalse(resultado);

        verifyNoInteractions(repository);
    }

    @Test
    void naoDevePermitirEmailQuandoRotaIdForNulo() {
        boolean resultado =
                service.podeReceberEmail(
                        3L,
                        null
                );

        assertFalse(resultado);

        verifyNoInteractions(repository);
    }

    private PreferenciaNotificacao criarPreferencia(
            Long usuarioId,
            boolean usuarioAtivo,
            Long rotaId,
            boolean rotaAtiva,
            boolean emailAtivo
    ) {
        Usuario usuario =
                new Usuario();

        usuario.setId(usuarioId);
        usuario.setNome("Usuário Teste");
        usuario.setEmail("usuario.teste@simul.local");
        usuario.setAtivo(usuarioAtivo);

        Rota rota =
                new Rota();

        rota.setId(rotaId);
        rota.setNome("Rota Teste");
        rota.setAtivo(rotaAtiva);

        PreferenciaNotificacao preferencia =
                new PreferenciaNotificacao();

        preferencia.setUsuario(usuario);
        preferencia.setRota(rota);
        preferencia.setEmailAtivo(emailAtivo);

        return preferencia;
    }
}