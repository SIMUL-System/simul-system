package com.simulsystem.backend.business.cronograma.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;

import java.time.LocalDateTime;
import java.time.LocalTime;

/** Coleta devolvida ao painel admin; horário vazio quando a fonte informa só o turno. */
public record CronogramaResponseDTO(
        Long id,
        Long rotaId,
        String nomeRota,
        DiaSemana diaSemana,
        Turno turno,
        LocalTime horarioInicio,
        LocalTime horarioFim,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}
