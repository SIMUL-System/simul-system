package com.simulsystem.backend.business.notificacao.dto;

import java.time.LocalDateTime;

/** Inscrição de navegador devolvida ao usuário. */
public record PushSubscriptionResponseDTO(
        Long id,
        String endpoint,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}
