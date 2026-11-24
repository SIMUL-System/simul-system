package com.simulsystem.backend.business.rota.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;

import java.time.LocalTime;

/** Horário de coleta resumido, usado na consulta pública. */
public record CronogramaResumoDTO(DiaSemana diaSemana, LocalTime horarioInicio, LocalTime horarioFim) {
}
