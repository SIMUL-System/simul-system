package com.simulsystem.backend.business.rota.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Bairros que passam a ser atendidos por uma rota, sempre da cidade da rota.
 * Bairro novo é cadastrado; bairro da mesma cidade em outra rota é movido.
 * A cidade é opcional; se vier, precisa ser a da rota.
 */
public record BairrosRotaRequestDTO(

        @Size(max = 120, message = "A cidade deve possuir no máximo 120 caracteres.")
        String cidade,

        @NotEmpty(message = "Escolha pelo menos um bairro.")
        @Size(max = 200, message = "É possível enviar no máximo 200 bairros por vez.")
        List<
                @NotBlank(message = "O nome do bairro é obrigatório.")
                @Size(max = 120, message = "O bairro deve possuir no máximo 120 caracteres.")
                String> bairros
) {
}
