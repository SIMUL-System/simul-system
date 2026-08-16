package com.simulsystem.backend.business.notificacao.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PreferenciaNotificacaoRequestDTO(

        @NotNull(message = "A rota é obrigatória.")
        Long rotaId,

        @NotNull(message = "A configuração de e-mail é obrigatória.")
        Boolean emailAtivo,

        @NotNull(message = "A configuração de Web Push é obrigatória.")
        Boolean webPushAtivo,

        @NotNull(message = "A antecedência é obrigatória.")
        @Min(
                value = 0,
                message = "A antecedência não pode ser negativa."
        )
        @Max(
                value = 72,
                message = "A antecedência não pode ultrapassar 72 horas."
        )
        Integer antecedenciaHoras

) {
}