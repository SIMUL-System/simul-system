package com.simulsystem.backend.business.rota.dto;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;

import java.time.LocalTime;

/**
 * Coleta resumida, usada na consulta pública: dia e turno, com o horário
 * só quando a prefeitura informa (senão, início e fim vêm vazios).
 */
public record CronogramaResumoDTO(DiaSemana diaSemana, LocalTime horarioInicio, LocalTime horarioFim, Turno turno) {
}
