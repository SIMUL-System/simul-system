package com.simulsystem.backend.business.rota.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RotaRequestDTO(

        @NotBlank(message = "O nome da rota é obrigatório.")
        @Size(max = 120, message = "O nome da rota deve possuir no máximo 120 caracteres.")
        String nome,

        @Size(max = 255, message = "A descrição deve possuir no máximo 255 caracteres.")
        String descricao
) {
}