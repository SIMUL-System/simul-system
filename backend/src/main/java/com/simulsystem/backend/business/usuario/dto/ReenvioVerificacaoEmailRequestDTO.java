package com.simulsystem.backend.business.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReenvioVerificacaoEmailRequestDTO(

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "O e-mail informado é inválido.")
        @Size(
                max = 150,
                message = "O e-mail deve possuir no máximo 150 caracteres."
        )
        String email
) {
}