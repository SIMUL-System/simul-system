package com.simulsystem.backend.business.cronograma.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/** Corpo para criar ou editar um horário de coleta (rota, dia, início e fim). */
public record CronogramaRequestDTO(

        @NotNull(message = "A rota é obrigatória.")
        Long rotaId,

        @NotNull(message = "O dia da semana é obrigatório.")
        DiaSemana diaSemana,

        @NotNull(message = "O horário de início é obrigatório.")
        LocalTime horarioInicio,

        @NotNull(message = "O horário de fim é obrigatório.")
        LocalTime horarioFim
) {
}
