package com.simulsystem.backend.business.institucional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Textos da página "Quem somos". */
public record TextosInstitucionaisRequestDTO(

        @NotBlank(message = "Escreva o texto sobre o projeto.")
        @Size(max = 4000, message = "O texto sobre o projeto deve ter no máximo 4000 caracteres.")
        String sobreProjeto,

        @NotBlank(message = "Informe o nome da instituição.")
        @Size(max = 150, message = "O nome da instituição deve ter no máximo 150 caracteres.")
        String instituicaoNome,

        @NotBlank(message = "Escreva o texto sobre a instituição.")
        @Size(max = 4000, message = "O texto sobre a instituição deve ter no máximo 4000 caracteres.")
        String instituicaoTexto,

        @NotBlank(message = "Informe o curso.")
        @Size(max = 150, message = "O curso deve ter no máximo 150 caracteres.")
        String curso
) {
}
