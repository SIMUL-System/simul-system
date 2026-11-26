package com.simulsystem.backend.business.cidade.dto;

import com.simulsystem.backend.business.cidade.model.Cidade;

import jakarta.validation.constraints.Size;

import java.time.LocalTime;

/**
 * Faixa média dos turnos de uma cidade ("diurno das 7h às 16h, noturno das
 * 19h às 4h"), informada pela operadora. Serve para mostrar um horário
 * aproximado e para calcular o lembrete; não é o horário exato de cada rota.
 * Os campos vazios significam que a cidade não informou aquele turno.
 */
public record FaixaTurnosDTO(
        LocalTime diurnoInicio,
        LocalTime diurnoFim,
        LocalTime noturnoInicio,
        LocalTime noturnoFim,

        @Size(max = 255, message = "A fonte deve possuir no máximo 255 caracteres.")
        String fonte
) {

    /** Faixa dos turnos guardada na cidade. */
    public static FaixaTurnosDTO de(Cidade cidade) {
        return new FaixaTurnosDTO(
                cidade.getDiurnoInicio(),
                cidade.getDiurnoFim(),
                cidade.getNoturnoInicio(),
                cidade.getNoturnoFim(),
                cidade.getFonteTurnos()
        );
    }
}
