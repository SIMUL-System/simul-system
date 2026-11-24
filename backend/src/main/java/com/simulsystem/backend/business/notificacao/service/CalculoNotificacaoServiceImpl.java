package com.simulsystem.backend.business.notificacao.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class CalculoNotificacaoServiceImpl
        implements CalculoNotificacaoService {

    @Override
    public LocalDateTime calcularHorarioEnvio(
            LocalDateTime proximaColeta,
            Integer antecedenciaHoras
    ) {
        if (proximaColeta == null) {
            throw new IllegalArgumentException(
                    "A data da próxima coleta é obrigatória."
            );
        }

        validarAntecedencia(antecedenciaHoras);

        return proximaColeta.minusHours(
                antecedenciaHoras
        );
    }

    @Override
    public LocalDateTime calcularHorarioColetaAlvo(
            LocalDateTime referencia,
            Integer antecedenciaHoras
    ) {
        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        validarAntecedencia(antecedenciaHoras);

        return referencia
                .truncatedTo(ChronoUnit.MINUTES)
                .plusHours(antecedenciaHoras);
    }

    private void validarAntecedencia(
            Integer antecedenciaHoras
    ) {
        if (antecedenciaHoras == null) {
            throw new IllegalArgumentException(
                    "A antecedência da notificação é obrigatória."
            );
        }

        if (antecedenciaHoras < 0) {
            throw new IllegalArgumentException(
                    "A antecedência da notificação não pode ser negativa."
            );
        }
    }
}
