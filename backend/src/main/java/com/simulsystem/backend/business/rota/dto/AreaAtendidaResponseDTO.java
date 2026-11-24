package com.simulsystem.backend.business.rota.dto;

/** Área atendida devolvida ao painel admin, com a rota e se já tem contorno. */
public record AreaAtendidaResponseDTO(
        Long id,
        String cidade,
        String bairro,
        Long rotaId,
        String nomeRota,
        boolean possuiGeometria
) {
}
