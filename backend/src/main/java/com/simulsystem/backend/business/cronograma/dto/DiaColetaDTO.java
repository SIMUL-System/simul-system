package com.simulsystem.backend.business.cronograma.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/** Um dia de coleta da semana de uma rota, com início e fim. */
public record DiaColetaDTO(

        @NotNull(message = "O dia da semana é obrigatório.")
        DiaSemana diaSemana,

        @NotNull(message = "O horário de início é obrigatório.")
        LocalTime horarioInicio,

        @NotNull(message = "O horário de fim é obrigatório.")
        LocalTime horarioFim
) {
}
