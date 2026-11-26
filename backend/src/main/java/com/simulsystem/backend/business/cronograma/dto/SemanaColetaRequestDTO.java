package com.simulsystem.backend.business.cronograma.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Semana completa de coleta de uma rota. Os dias enviados passam a ser os
 * únicos ativos da rota; os dias que ficarem de fora são desativados.
 */
public record SemanaColetaRequestDTO(

        @NotEmpty(message = "Escolha pelo menos um dia de coleta.")
        @Size(max = 7, message = "A semana tem no máximo 7 dias de coleta.")
        List<@Valid @NotNull(message = "O dia de coleta é obrigatório.") DiaColetaDTO> dias
) {
}
