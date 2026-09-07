package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class ProcessamentoNotificacaoServiceImpl
        implements ProcessamentoNotificacaoService {

    private static final DateTimeFormatter FORMATADOR =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    private final DecisaoNotificacaoService decisaoNotificacaoService;
    private final CronogramaService cronogramaService;
    private final HistoricoNotificacaoService historicoNotificacaoService;
    private final EnvioNotificacaoService envioNotificacaoService;

    public ProcessamentoNotificacaoServiceImpl(
            DecisaoNotificacaoService decisaoNotificacaoService,
            CronogramaService cronogramaService,
            HistoricoNotificacaoService historicoNotificacaoService,
            EnvioNotificacaoService envioNotificacaoService
    ) {
        this.decisaoNotificacaoService =
                decisaoNotificacaoService;

        this.cronogramaService =
                cronogramaService;

        this.historicoNotificacaoService =
                historicoNotificacaoService;

        this.envioNotificacaoService =
                envioNotificacaoService;
    }

    @Override
    public void processar(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    ) {
        validarDados(
                preferencia,
                referencia
        );

        if (!decisaoNotificacaoService
                .estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                )) {
            return;
        }

        Optional<LocalDateTime> proximaColeta =
                cronogramaService.calcularProximaColeta(
                        preferencia.getRota().getId(),
                        referencia
                );

        if (proximaColeta.isEmpty()) {
            return;
        }

        LocalDateTime dataHoraColeta =
                proximaColeta.orElseThrow();

        if (Boolean.TRUE.equals(
                preferencia.getEmailAtivo()
        )) {
            processarCanal(
                    preferencia,
                    dataHoraColeta,
                    referencia,
                    CanalNotificacao.EMAIL,
                    TipoNotificacao.EMAIL
            );
        }

        if (Boolean.TRUE.equals(
                preferencia.getWebPushAtivo()
        )) {
            processarCanal(
                    preferencia,
                    dataHoraColeta,
                    referencia,
                    CanalNotificacao.WEB_PUSH,
                    TipoNotificacao.WEB_PUSH
            );
        }
    }

    private void processarCanal(
            PreferenciaNotificacao preferencia,
            LocalDateTime dataHoraColeta,
            LocalDateTime referencia,
            CanalNotificacao canalHistorico,
            TipoNotificacao tipoNotificacao
    ) {
        Optional<HistoricoNotificacao> reserva =
                historicoNotificacaoService.reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        dataHoraColeta,
                        canalHistorico
                );

        if (reserva.isEmpty()) {
            return;
        }

        HistoricoNotificacao historico =
                reserva.orElseThrow();

        try {
            envioNotificacaoService.enviar(
                    tipoNotificacao,
                    preferencia.getUsuario().getEmail(),
                    criarAssunto(),
                    criarMensagem(
                            preferencia,
                            dataHoraColeta
                    )
            );

            historicoNotificacaoService.marcarComoEnviado(
                    historico.getId(),
                    referencia
            );

        } catch (RuntimeException exception) {
            historicoNotificacaoService.marcarComoFalha(
                    historico.getId(),
                    obterMensagemErro(exception),
                    referencia
            );
        }
    }

    private String criarAssunto() {
        return "SIMUL - Lembrete de coleta seletiva";
    }

    private String criarMensagem(
            PreferenciaNotificacao preferencia,
            LocalDateTime dataHoraColeta
    ) {
        return "Olá, "
                + preferencia.getUsuario().getNome()
                + "! A coleta seletiva da rota "
                + preferencia.getRota().getNome()
                + " está prevista para "
                + dataHoraColeta.format(FORMATADOR)
                + ".";
    }

    private String obterMensagemErro(
            RuntimeException exception
    ) {
        if (
                exception.getMessage() != null
                && !exception.getMessage().isBlank()
        ) {
            return exception.getMessage();
        }

        return exception
                .getClass()
                .getSimpleName();
    }

    private void validarDados(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    ) {
        if (preferencia == null) {
            throw new IllegalArgumentException(
                    "A preferência de notificação é obrigatória."
            );
        }

        if (preferencia.getUsuario() == null) {
            throw new IllegalArgumentException(
                    "O usuário da preferência é obrigatório."
            );
        }

        if (preferencia.getRota() == null) {
            throw new IllegalArgumentException(
                    "A rota da preferência é obrigatória."
            );
        }

        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }
    }
}