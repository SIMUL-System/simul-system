package com.simulsystem.backend.business.rota.dto;

import java.util.List;

/** Resposta da consulta pública: rota, contorno e horários ativos do bairro. */
public record ConsultaColetaResponseDTO(
        String cidade,
        String bairro,
        Long rotaId,
        String nomeRota,
        String geometriaGeoJson,
        List<CronogramaResumoDTO> cronogramas
) {
}
