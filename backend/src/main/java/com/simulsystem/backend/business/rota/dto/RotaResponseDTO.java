package com.simulsystem.backend.business.rota.dto;

import com.simulsystem.backend.business.rota.model.TipoColeta;

import java.time.LocalDateTime;

/** Rota devolvida ao painel admin, com a cidade, o tipo de coleta e a fonte. */
public record RotaResponseDTO(
        Long id,
        String nome,
        String descricao,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao,
        Long cidadeId,
        String cidade,
        TipoColeta tipoColeta,
        String fonte
) {
}
