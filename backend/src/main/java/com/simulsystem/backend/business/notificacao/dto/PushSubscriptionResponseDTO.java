package com.simulsystem.backend.business.notificacao.dto;

import java.time.LocalDateTime;

public record PushSubscriptionResponseDTO(
        Long id,
        String endpoint,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}