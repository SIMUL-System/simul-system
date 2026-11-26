package com.simulsystem.backend.business.cronograma.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/**
 * Uma coleta da semana de uma rota: dia, turno e, quando conhecido, o
 * horário. Um mesmo dia pode ter coleta diurna e noturna.
 */
public record DiaColetaDTO(

        @NotNull(message = "O dia da semana é obrigatório.")
        DiaSemana diaSemana,

        Turno turno,

        LocalTime horarioInicio,

        LocalTime horarioFim
) {
}
