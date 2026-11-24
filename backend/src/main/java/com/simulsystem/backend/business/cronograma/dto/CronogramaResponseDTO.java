package com.simulsystem.backend.business.cronograma.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;

import java.time.LocalDateTime;
import java.time.LocalTime;

/** Horário de coleta devolvido ao painel admin. */
public record CronogramaResponseDTO(
        Long id,
        Long rotaId,
        String nomeRota,
        DiaSemana diaSemana,
        LocalTime horarioInicio,
        LocalTime horarioFim,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}
