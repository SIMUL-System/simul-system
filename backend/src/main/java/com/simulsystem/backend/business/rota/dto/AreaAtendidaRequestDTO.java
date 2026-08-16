package com.simulsystem.backend.business.rota.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AreaAtendidaRequestDTO(

        @NotBlank(message = "A cidade é obrigatória.")
        @Size(max = 120, message = "A cidade deve possuir no máximo 120 caracteres.")
        String cidade,

        @NotBlank(message = "O bairro é obrigatório.")
        @Size(max = 120, message = "O bairro deve possuir no máximo 120 caracteres.")
        String bairro,

        @NotNull(message = "A rota é obrigatória.")
        Long rotaId
) {
}