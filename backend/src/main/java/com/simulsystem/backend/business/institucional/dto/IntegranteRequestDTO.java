package com.simulsystem.backend.business.institucional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados de um integrante (a foto é enviada à parte). */
public record IntegranteRequestDTO(

        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String nome,

        @NotBlank(message = "Informe a função na equipe.")
        @Size(max = 120, message = "A função deve ter no máximo 120 caracteres.")
        String funcao,

        @NotBlank(message = "Escreva a descrição.")
        @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres.")
        String descricao,

        @Size(max = 255, message = "O link deve ter no máximo 255 caracteres.")
        String link
) {
}
