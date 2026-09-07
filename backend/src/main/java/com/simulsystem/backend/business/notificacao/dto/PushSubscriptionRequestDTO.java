package com.simulsystem.backend.business.notificacao.dto;

import jakarta.validation.constraints.NotBlank;

public record PushSubscriptionRequestDTO(

        @NotBlank(
                message = "O endpoint da subscription é obrigatório."
        )
        String endpoint,

        @NotBlank(
                message = "A chave p256dh é obrigatória."
        )
        String p256dh,

        @NotBlank(
                message = "A chave auth é obrigatória."
        )
        String auth
) {
}