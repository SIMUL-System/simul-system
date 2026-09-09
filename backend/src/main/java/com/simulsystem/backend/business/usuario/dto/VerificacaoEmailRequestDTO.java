package com.simulsystem.backend.business.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerificacaoEmailRequestDTO(

        @NotBlank(message = "O token de verificação é obrigatório.")
        @Size(
                min = 32,
                max = 512,
                message = "O token de verificação é inválido."
        )
        String token
) {
}