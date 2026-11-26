package com.simulsystem.backend.business.rota.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Corpo para criar ou editar um bairro atendido. A cidade do bairro é a da
 * rota; se a cidade for enviada, precisa ser a mesma da rota.
 */
public record AreaAtendidaRequestDTO(

        @Size(max = 120, message = "A cidade deve possuir no máximo 120 caracteres.")
        String cidade,

        @NotBlank(message = "O bairro é obrigatório.")
        @Size(max = 120, message = "O bairro deve possuir no máximo 120 caracteres.")
        String bairro,

        @NotNull(message = "A rota é obrigatória.")
        Long rotaId
) {
}
