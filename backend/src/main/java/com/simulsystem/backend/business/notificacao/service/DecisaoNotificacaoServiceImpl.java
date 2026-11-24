package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DecisaoNotificacaoServiceImpl implements DecisaoNotificacaoService {

    private final CronogramaService cronogramaService;
    private final CalculoNotificacaoService calculoNotificacaoService;

    public DecisaoNotificacaoServiceImpl(
            CronogramaService cronogramaService,
            CalculoNotificacaoService calculoNotificacaoService
    ) {
        this.cronogramaService = cronogramaService;
        this.calculoNotificacaoService = calculoNotificacaoService;
    }

    /**
     * O lembrete vence no minuto de referência quando existe uma coleta
     * ativa exatamente em (referência + antecedência).
     *
     * Partir da referência para a frente evita o erro de calcular a
     * "próxima coleta a partir de agora": quando a antecedência é maior
     * ou igual ao intervalo entre duas coletas da rota, a próxima coleta
     * não é a coleta cujo lembrete está vencendo.
     */
    @Override
    public Optional<LocalDateTime> buscarColetaParaLembrete(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    ) {
        if (preferencia == null) {
            throw new IllegalArgumentException(
                    "A preferência de notificação é obrigatória."
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

        LocalDateTime horarioColetaAlvo =
                calculoNotificacaoService.calcularHorarioColetaAlvo(
                        referencia,
                        preferencia.getAntecedenciaHoras()
                );

        return cronogramaService.buscarColetaNoHorario(
                preferencia.getRota().getId(),
                horarioColetaAlvo
        );
    }
}
