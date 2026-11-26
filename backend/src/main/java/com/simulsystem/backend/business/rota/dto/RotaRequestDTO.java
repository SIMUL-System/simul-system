package com.simulsystem.backend.business.rota.dto;

import com.simulsystem.backend.business.rota.model.TipoColeta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Corpo para criar ou editar uma rota. A cidade é escolhida na criação e não
 * muda depois. Sem tipo de coleta, a rota é tratada como coleta seletiva.
 */
public record RotaRequestDTO(

        @NotBlank(message = "O nome da rota é obrigatório.")
        @Size(max = 120, message = "O nome da rota deve possuir no máximo 120 caracteres.")
        String nome,

        @Size(max = 255, message = "A descrição deve possuir no máximo 255 caracteres.")
        String descricao,

        @NotNull(message = "A cidade da rota é obrigatória.")
        Long cidadeId,

        TipoColeta tipoColeta
) {
}
