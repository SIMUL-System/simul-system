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
        this.decisaoNotificacaoService = decisaoNotificacaoService;
        this.cronogramaService = cronogramaService;
        this.historicoNotificacaoService = historicoNotificacaoService;
        this.envioNotificacaoService = envioNotificacaoService;
    }

    @Override
    public void processar(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    ) {
        validarDados(preferencia, referencia);

        if (!decisaoNotificacaoService
                .estaNoHorarioDoLembrete(preferencia, referencia)) {
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

        if (Boolean.TRUE.equals(preferencia.getEmailAtivo())) {
            processarEmail(
                    preferencia,
                    proximaColeta.orElseThrow(),
                    referencia
            );
        }

        /*
         * Web Push será conectado aqui quando existir
         * WebPushNotificacaoStrategy.
         *
         * Não registramos envio WEB_PUSH enquanto não houver
         * transporte real implementado.
         */
    }

    private void processarEmail(
            PreferenciaNotificacao preferencia,
            LocalDateTime dataHoraColeta,
            LocalDateTime referencia
    ) {
        Optional<HistoricoNotificacao> reserva =
                historicoNotificacaoService.reservarEnvio(
                        preferencia.getUsuario(),
                        preferencia.getRota(),
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        if (reserva.isEmpty()) {
            return;
        }

        HistoricoNotificacao historico =
                reserva.orElseThrow();

        try {
            envioNotificacaoService.enviar(
                    TipoNotificacao.EMAIL,
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
        exception.getMessage(),
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