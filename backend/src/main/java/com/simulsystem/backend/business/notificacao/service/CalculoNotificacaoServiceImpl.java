package com.simulsystem.backend.business.notificacao.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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

        return proximaColeta.minusHours(
                antecedenciaHoras
        );
    }
}