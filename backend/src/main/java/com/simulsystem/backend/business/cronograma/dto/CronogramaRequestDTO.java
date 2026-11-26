package com.simulsystem.backend.business.cronograma.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/**
 * Corpo para criar ou editar uma coleta da rota: dia e turno, com horário
 * opcional. Sem horário, o turno é obrigatório; com horário e sem turno, o
 * turno é deduzido do início (das 18h às 5h59, noturno).
 */
public record CronogramaRequestDTO(

        @NotNull(message = "A rota é obrigatória.")
        Long rotaId,

        @NotNull(message = "O dia da semana é obrigatório.")
        DiaSemana diaSemana,

        Turno turno,

        LocalTime horarioInicio,

        LocalTime horarioFim
) {
}
