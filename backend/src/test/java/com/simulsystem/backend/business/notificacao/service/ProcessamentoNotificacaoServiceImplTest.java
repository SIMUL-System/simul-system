package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessamentoNotificacaoServiceImplTest {

    @Mock
    private DecisaoNotificacaoService decisaoNotificacaoService;

    @Mock
    private CronogramaService cronogramaService;

    @Mock
    private HistoricoNotificacaoService historicoNotificacaoService;

    @Mock
    private EnvioNotificacaoService envioNotificacaoService;

    private ProcessamentoNotificacaoServiceImpl service;

    private PreferenciaNotificacao preferencia;
    private LocalDateTime referencia;
    private LocalDateTime proximaColeta;

    @BeforeEach
    void setUp() {
        service = new ProcessamentoNotificacaoServiceImpl(
                decisaoNotificacaoService,
                cronogramaService,
                historicoNotificacaoService,
                envioNotificacaoService
        );

        Usuario usuario = new Usuario();
        usuario.setId(3L);
        usuario.setNome("Usuário Teste SIMUL");
        usuario.setEmail("usuario.teste@simul.local");

        Rota rota = new Rota();
        rota.setId(1L);
        rota.setNome("Rota Jardim Nova Goiânia");

        preferencia = new PreferenciaNotificacao();
        preferencia.setUsuario(usuario);
        preferencia.setRota(rota);
        preferencia.setEmailAtivo(true);
        preferencia.setWebPushAtivo(false);
        preferencia.setAntecedenciaHoras(3);

        referencia =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        proximaColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);
    }

    @Test
    void naoDeveProcessarQuandoNaoForHorarioDoLembrete() {
        when(decisaoNotificacaoService
                .estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                ))
                .thenReturn(false);

        service.processar(preferencia, referencia);

        verifyNoInteractions(
                cronogramaService,
                historicoNotificacaoService,
                envioNotificacaoService
        );
    }

    @Test
    void deveEnviarEmailQuandoCanalEstiverAtivo() {
        HistoricoNotificacao historico =
                new HistoricoNotificacao();
        historico.setId(10L);

        when(decisaoNotificacaoService
                .estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                ))
                .thenReturn(true);

        when(cronogramaService.calcularProximaColeta(
                1L,
                referencia
        )).thenReturn(Optional.of(proximaColeta));

        when(historicoNotificacaoService.reservarEnvio(
                preferencia.getUsuario(),
                preferencia.getRota(),
                proximaColeta,
                CanalNotificacao.EMAIL
        )).thenReturn(Optional.of(historico));

        service.processar(preferencia, referencia);

        verify(envioNotificacaoService).enviar(
                eq(TipoNotificacao.EMAIL),
                eq("usuario.teste@simul.local"),
                anyString(),
                anyString()
        );

        verify(historicoNotificacaoService)
                .marcarComoEnviado(
                        10L,
                        referencia
                );
    }

    @Test
    void naoDeveEnviarQuandoHistoricoJaEstiverReservado() {
        when(decisaoNotificacaoService
                .estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                ))
                .thenReturn(true);

        when(cronogramaService.calcularProximaColeta(
                1L,
                referencia
        )).thenReturn(Optional.of(proximaColeta));

        when(historicoNotificacaoService.reservarEnvio(
                preferencia.getUsuario(),
                preferencia.getRota(),
                proximaColeta,
                CanalNotificacao.EMAIL
        )).thenReturn(Optional.empty());

        service.processar(preferencia, referencia);

        verifyNoInteractions(envioNotificacaoService);

        verify(historicoNotificacaoService, never())
                .marcarComoEnviado(
                        anyLong(),
                        any(LocalDateTime.class)
                );
    }

    @Test
    void deveMarcarComoFalhaQuandoEnvioGerarErro() {
        HistoricoNotificacao historico =
                new HistoricoNotificacao();
        historico.setId(10L);

        when(decisaoNotificacaoService
                .estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                ))
                .thenReturn(true);

        when(cronogramaService.calcularProximaColeta(
                1L,
                referencia
        )).thenReturn(Optional.of(proximaColeta));

        when(historicoNotificacaoService.reservarEnvio(
                preferencia.getUsuario(),
                preferencia.getRota(),
                proximaColeta,
                CanalNotificacao.EMAIL
        )).thenReturn(Optional.of(historico));

        doThrow(new RuntimeException("Erro SMTP"))
                .when(envioNotificacaoService)
                .enviar(
                        eq(TipoNotificacao.EMAIL),
                        eq("usuario.teste@simul.local"),
                        anyString(),
                        anyString()
                );

        service.processar(preferencia, referencia);

        verify(historicoNotificacaoService)
                .marcarComoFalha(
                        10L,
                        "Erro SMTP"
                );

        verify(historicoNotificacaoService, never())
                .marcarComoEnviado(
                        anyLong(),
                        any(LocalDateTime.class)
                );
    }

    @Test
    void naoDeveEnviarEmailQuandoEmailEstiverDesativado() {
        preferencia.setEmailAtivo(false);
        preferencia.setWebPushAtivo(true);

        when(decisaoNotificacaoService
                .estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                ))
                .thenReturn(true);

        when(cronogramaService.calcularProximaColeta(
                1L,
                referencia
        )).thenReturn(Optional.of(proximaColeta));

        service.processar(preferencia, referencia);

        verifyNoInteractions(
                historicoNotificacaoService,
                envioNotificacaoService
        );
    }
}