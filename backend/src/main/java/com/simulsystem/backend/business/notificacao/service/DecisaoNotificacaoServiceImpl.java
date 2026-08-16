package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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

    @Override
    public boolean estaNoHorarioDoLembrete(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    ) {
        if (preferencia == null) {
            throw new IllegalArgumentException(
                    "A preferência de notificação é obrigatória."
            );
        }

        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        Optional<LocalDateTime> proximaColeta =
                cronogramaService.calcularProximaColeta(
                        preferencia.getRota().getId(),
                        referencia
                );

        if (proximaColeta.isEmpty()) {
            return false;
        }

        LocalDateTime horarioEnvio =
                calculoNotificacaoService.calcularHorarioEnvio(
                        proximaColeta.orElseThrow(),
                        preferencia.getAntecedenciaHoras()
                );

        LocalDateTime horarioEnvioPorMinuto =
                horarioEnvio.truncatedTo(ChronoUnit.MINUTES);

        LocalDateTime referenciaPorMinuto =
                referencia.truncatedTo(ChronoUnit.MINUTES);

        return horarioEnvioPorMinuto.equals(referenciaPorMinuto);
    }
}