package com.simulsystem.backend.business.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinicaoSenhaRequestDTO(

        @NotBlank(message = "O token de recuperação é obrigatório.")
        @Size(
                min = 32,
                max = 512,
                message = "O token de recuperação é inválido."
        )
        String token,

        @NotBlank(message = "A nova senha é obrigatória.")
        @Size(
                min = 8,
                max = 100,
                message = "A nova senha deve possuir entre 8 e 100 caracteres."
        )
        String novaSenha,

        @NotBlank(message = "A confirmação da nova senha é obrigatória.")
        @Size(
                min = 8,
                max = 100,
                message = "A confirmação da senha deve possuir entre 8 e 100 caracteres."
        )
        String confirmacaoSenha
) {
}