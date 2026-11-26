package com.simulsystem.backend.business.privacidade.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Aceite de uma nova versão dos Termos de Uso e da Política de Privacidade. */
public record AceiteTermosRequestDTO(

        @NotBlank(message = "A versão dos termos é obrigatória.")
        @Size(max = 20, message = "A versão dos termos deve possuir no máximo 20 caracteres.")
        String versao
) {
}
