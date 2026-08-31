package com.simulsystem.backend.business.rota.dto;

public record AreaAtendidaResponseDTO(
        Long id,
        String cidade,
        String bairro,
        Long rotaId,
        String nomeRota,
        boolean possuiGeometria
) {
}