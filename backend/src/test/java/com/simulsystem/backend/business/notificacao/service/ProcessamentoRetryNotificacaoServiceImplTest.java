package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.StatusNotificacao;
import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessamentoRetryNotificacaoServiceImplTest {

    @Mock
    private HistoricoNotificacaoService historicoNotificacaoService;

    @Mock
    private EnvioNotificacaoService envioNotificacaoService;

    private ProcessamentoRetryNotificacaoServiceImpl service;

    private LocalDateTime referencia;

    @BeforeEach
    void setUp() {
        service =
                new ProcessamentoRetryNotificacaoServiceImpl(
                        historicoNotificacaoService,
                        envioNotificacaoService
                );

        referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        16,
                        5
                );
    }

    @Test
    void deveReenviarEmailQuandoRetryEstiverElegivel() {
        HistoricoNotificacao historico =
                criarHistoricoEmail(1L);

        when(historicoNotificacaoService
                .buscarFalhasElegiveisParaRetry(
                        referencia
                ))
                .thenReturn(List.of(historico));

        service.processar(referencia);

        verify(envioNotificacaoService).enviar(
                eq(TipoNotificacao.EMAIL),
                eq("usuario.teste@simul.local"),
                anyString(),
                anyString()
        );

        verify(historicoNotificacaoService)
                .marcarComoEnviado(
                        1L,
                        referencia
                );
    }

    @Test
    void deveRegistrarNovaFalhaQuandoRetryFalhar() {
        HistoricoNotificacao historico =
                criarHistoricoEmail(1L);

        when(historicoNotificacaoService
                .buscarFalhasElegiveisParaRetry(
                        referencia
                ))
                .thenReturn(List.of(historico));

        doThrow(
                new RuntimeException(
                        "SMTP indisponível"
                )
        ).when(envioNotificacaoService)
                .enviar(
                        eq(TipoNotificacao.EMAIL),
                        eq("usuario.teste@simul.local"),
                        anyString(),
                        anyString()
                );

        service.processar(referencia);

        verify(historicoNotificacaoService)
                .marcarComoFalha(
                        1L,
                        "SMTP indisponível",
                        referencia
                );

        verify(historicoNotificacaoService, never())
                .marcarComoEnviado(
                        anyLong(),
                        any(LocalDateTime.class)
                );
    }

    @Test
    void naoDeveEnviarQuandoNaoExistiremRetriesElegiveis() {
        when(historicoNotificacaoService
                .buscarFalhasElegiveisParaRetry(
                        referencia
                ))
                .thenReturn(List.of());

        service.processar(referencia);

        verifyNoInteractions(
                envioNotificacaoService
        );
    }

    @Test
    void deveContinuarProcessandoQuandoUmRetryGerarErroInesperado() {
        HistoricoNotificacao historicoInvalido =
                new HistoricoNotificacao();
        historicoInvalido.setId(1L);

        HistoricoNotificacao historicoValido =
                criarHistoricoEmail(2L);

        when(historicoNotificacaoService
                .buscarFalhasElegiveisParaRetry(
                        referencia
                ))
                .thenReturn(
                        List.of(
                                historicoInvalido,
                                historicoValido
                        )
                );

        service.processar(referencia);

        verify(envioNotificacaoService).enviar(
                eq(TipoNotificacao.EMAIL),
                eq("usuario.teste@simul.local"),
                anyString(),
                anyString()
        );

        verify(historicoNotificacaoService)
                .marcarComoEnviado(
                        2L,
                        referencia
                );
    }

    @Test
    void deveRejeitarReferenciaNula() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.processar(null)
        );

        verifyNoInteractions(
                historicoNotificacaoService,
                envioNotificacaoService
        );
    }

    private HistoricoNotificacao criarHistoricoEmail(
            Long id
    ) {
        Usuario usuario = new Usuario();
        usuario.setId(3L);
        usuario.setNome("Usuário Teste SIMUL");
        usuario.setEmail(
                "usuario.teste@simul.local"
        );

        Rota rota = new Rota();
        rota.setId(1L);
        rota.setNome(
                "Rota Jardim Nova Goiânia"
        );

        HistoricoNotificacao historico =
                new HistoricoNotificacao();

        historico.setId(id);
        historico.setUsuario(usuario);
        historico.setRota(rota);

        historico.setDataHoraColeta(
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                )
        );

        historico.setCanal(
                CanalNotificacao.EMAIL
        );

        historico.setStatus(
                StatusNotificacao.FALHA
        );

        historico.setNumeroTentativas(1);

        historico.setProximaTentativa(
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        16,
                        5
                )
        );

        return historico;
    }
}