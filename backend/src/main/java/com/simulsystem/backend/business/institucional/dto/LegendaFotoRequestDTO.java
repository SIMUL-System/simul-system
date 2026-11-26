package com.simulsystem.backend.business.institucional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Legenda de uma foto (também é o texto lido por leitores de tela). */
public record LegendaFotoRequestDTO(

        @NotBlank(message = "Escreva uma legenda para a foto.")
        @Size(max = 200, message = "A legenda deve ter no máximo 200 caracteres.")
        String legenda
) {
}
