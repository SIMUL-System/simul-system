package com.simulsystem.backend.business.institucional.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Nova ordem de exibição: a lista completa de ids, do primeiro ao último. */
public record OrdemRequestDTO(

        @NotEmpty(message = "Envie a lista na nova ordem.")
        @Size(max = 100, message = "A lista pode ter no máximo 100 itens.")
        List<@NotNull(message = "O identificador é obrigatório.") Long> ids
) {
}
