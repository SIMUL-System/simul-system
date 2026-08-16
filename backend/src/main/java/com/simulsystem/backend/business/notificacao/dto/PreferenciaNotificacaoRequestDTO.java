package com.simulsystem.backend.business.notificacao.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PreferenciaNotificacaoRequestDTO(

        @NotNull
        Boolean emailAtivo,

        @NotNull
        @Min(0)
        Integer antecedenciaHoras

) {
}