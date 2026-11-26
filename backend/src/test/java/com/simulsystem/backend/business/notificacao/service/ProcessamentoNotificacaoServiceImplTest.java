package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cidade.CidadesDeTeste;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessamentoNotificacaoServiceImplTest {

    @Mock
    private DecisaoNotificacaoService decisaoNotificacaoService;

    @Mock
    private HistoricoNotificacaoService historicoNotificacaoService;

    @Mock
    private EnvioNotificacaoService envioNotificacaoService;

    private ProcessamentoNotificacaoServiceImpl service;

    private PreferenciaNotificacao preferencia;
    private LocalDateTime referencia;
    private LocalDateTime coletaDoLembrete;

    @BeforeEach
    void setUp() {
        service = new ProcessamentoNotificacaoServiceImpl(
                decisaoNotificacaoService,
                historicoNotificacaoService,
                envioNotificacaoService,
                new MensagemLembrete());

        Usuario usuario = new Usuario();
        usuario.setId(3L);
        usuario.setNome("Usuário Teste SIMUL");
        usuario.setEmail("usuario.teste@simul.local");

        Rota rota = new Rota();
        rota.setId(1L);
        rota.setNome("Rota Jardim Nova Goiânia");

        preferencia = new PreferenciaNotificacao();
        preferencia.setUsuario(usuario);
        AreaAtendida area = new AreaAtendida();
        area.setId(10L);
        area.setCidade(CidadesDeTeste.senadorCanedo());
        area.setBairro("Centro");
        area.setRota(rota);
        preferencia.setAreaAtendida(area);
        preferencia.setEmailAtivo(true);
        preferencia.setWebPushAtivo(false);
        preferencia.setAntecedenciaHoras(3);

        referencia = LocalDateTime.of(2026, 8, 17, 16, 0);

        coletaDoLembrete = LocalDateTime.of(2026, 8, 17, 19, 0);
    }

    @Test
    void naoDeveProcessarQuandoNaoForHorarioDoLembrete() {
        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.empty());

        service.processar(preferencia, referencia);

        verifyNoInteractions(historicoNotificacaoService, envioNotificacaoService);
    }

    @Test
    void deveEnviarEmailQuandoCanalEstiverAtivo() {
        HistoricoNotificacao historico = new HistoricoNotificacao();

        historico.setId(10L);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(Optional.of(historico));

        service.processar(preferencia, referencia);

        verify(envioNotificacaoService)
                .enviar(eq(CanalNotificacao.EMAIL), eq("usuario.teste@simul.local"), anyString(), anyString());

        verify(historicoNotificacaoService)
                .marcarComoEnviado(10L, referencia);
    }

    @Test
    void deveEnviarWebPushQuandoCanalEstiverAtivo() {
        preferencia.setEmailAtivo(false);
        preferencia.setWebPushAtivo(true);

        HistoricoNotificacao historico = new HistoricoNotificacao();

        historico.setId(20L);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.WEB_PUSH
                ))
                .thenReturn(Optional.of(historico));

        service.processar(preferencia, referencia);

        verify(envioNotificacaoService)
                .enviar(eq(CanalNotificacao.WEB_PUSH), eq("usuario.teste@simul.local"), anyString(), anyString());

        verify(historicoNotificacaoService)
                .marcarComoEnviado(20L, referencia);

        verify(envioNotificacaoService, never())
                .enviar(eq(CanalNotificacao.EMAIL), anyString(), anyString(), anyString());
    }

    @Test
    void deveEnviarEmailEWebPushQuandoAmbosEstiveremAtivos() {
        preferencia.setEmailAtivo(true);
        preferencia.setWebPushAtivo(true);

        HistoricoNotificacao historicoEmail = new HistoricoNotificacao();

        historicoEmail.setId(30L);

        HistoricoNotificacao historicoWebPush = new HistoricoNotificacao();

        historicoWebPush.setId(31L);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(Optional.of(historicoEmail));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.WEB_PUSH
                ))
                .thenReturn(Optional.of(historicoWebPush));

        service.processar(preferencia, referencia);

        verify(envioNotificacaoService)
                .enviar(eq(CanalNotificacao.EMAIL), eq("usuario.teste@simul.local"), anyString(), anyString());

        verify(envioNotificacaoService)
                .enviar(eq(CanalNotificacao.WEB_PUSH), eq("usuario.teste@simul.local"), anyString(), anyString());

        verify(historicoNotificacaoService)
                .marcarComoEnviado(30L, referencia);

        verify(historicoNotificacaoService)
                .marcarComoEnviado(31L, referencia);
    }

    @Test
    void naoDeveEnviarQuandoHistoricoJaEstiverReservado() {
        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(Optional.empty());

        service.processar(preferencia, referencia);

        verifyNoInteractions(envioNotificacaoService);

        verify(historicoNotificacaoService, never())
                .marcarComoEnviado(anyLong(), any(LocalDateTime.class));
    }

    @Test
    void deveMarcarComoFalhaQuandoEnvioEmailGerarErro() {
        HistoricoNotificacao historico = new HistoricoNotificacao();

        historico.setId(10L);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(Optional.of(historico));

        doThrow(new RuntimeException("Erro SMTP"))
                .when(envioNotificacaoService)
                .enviar(eq(CanalNotificacao.EMAIL), eq("usuario.teste@simul.local"), anyString(), anyString());

        service.processar(preferencia, referencia);

        verify(historicoNotificacaoService)
                .marcarComoFalha(10L, "Erro SMTP", referencia);

        verify(historicoNotificacaoService, never())
                .marcarComoEnviado(anyLong(), any(LocalDateTime.class));
    }

    @Test
    void deveMarcarComoFalhaQuandoWebPushGerarErro() {
        preferencia.setEmailAtivo(false);
        preferencia.setWebPushAtivo(true);

        HistoricoNotificacao historico = new HistoricoNotificacao();

        historico.setId(40L);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        when(historicoNotificacaoService
                .reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        coletaDoLembrete,
                        CanalNotificacao.WEB_PUSH
                ))
                .thenReturn(Optional.of(historico));

        doThrow(new RuntimeException("Erro Web Push"))
                .when(envioNotificacaoService)
                .enviar(eq(CanalNotificacao.WEB_PUSH), eq("usuario.teste@simul.local"), anyString(), anyString());

        service.processar(preferencia, referencia);

        verify(historicoNotificacaoService)
                .marcarComoFalha(40L, "Erro Web Push", referencia);

        verify(historicoNotificacaoService, never())
                .marcarComoEnviado(anyLong(), any(LocalDateTime.class));
    }

    @Test
    void naoDeveProcessarNenhumCanalQuandoAmbosEstiveremDesativados() {
        preferencia.setEmailAtivo(false);
        preferencia.setWebPushAtivo(false);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, referencia))
                .thenReturn(Optional.of(coletaDoLembrete));

        service.processar(preferencia, referencia);

        verifyNoInteractions(historicoNotificacaoService, envioNotificacaoService);
    }

    @Test
    void deveUsarColetaDoLembreteNaReservaENaMensagem() {
        // Coleta de quarta 07:00 com antecedência de 48 h: o lembrete
        // vence na segunda 07:00, mesmo havendo coleta na própria segunda.
        preferencia.setAntecedenciaHoras(48);

        LocalDateTime segunda0700 = LocalDateTime.of(2026, 11, 23, 7, 0);

        LocalDateTime quarta0700 = LocalDateTime.of(2026, 11, 25, 7, 0);

        HistoricoNotificacao historico = new HistoricoNotificacao();

        historico.setId(50L);

        when(decisaoNotificacaoService
                .buscarColetaParaLembrete(preferencia, segunda0700))
                .thenReturn(Optional.of(quarta0700));

        when(historicoNotificacaoService
                .reservarEnvio(preferencia.getUsuario(), preferencia.getRota(), quarta0700, CanalNotificacao.EMAIL))
                .thenReturn(Optional.of(historico));

        service.processar(preferencia, segunda0700);

        verify(envioNotificacaoService)
                .enviar(
                        eq(CanalNotificacao.EMAIL),
                        eq("usuario.teste@simul.local"),
                        anyString(),
                        contains("25/11/2026 às 07:00")
                );

        verify(historicoNotificacaoService)
                .marcarComoEnviado(50L, segunda0700);
    }
}
