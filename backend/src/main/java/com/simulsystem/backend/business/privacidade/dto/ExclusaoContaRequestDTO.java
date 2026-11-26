package com.simulsystem.backend.business.privacidade.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Pedido de exclusão da conta: a senha confirma que é o próprio dono. */
public record ExclusaoContaRequestDTO(

        @NotBlank(message = "Digite sua senha para confirmar.")
        @Size(max = 72, message = "A senha deve possuir no máximo 72 caracteres.")
        String senha
) {
}
