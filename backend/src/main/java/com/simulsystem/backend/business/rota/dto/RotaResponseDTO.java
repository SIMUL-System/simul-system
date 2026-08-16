package com.simulsystem.backend.business.rota.dto;

import java.time.LocalDateTime;

public record RotaResponseDTO(
        Long id,
        String nome,
        String descricao,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}