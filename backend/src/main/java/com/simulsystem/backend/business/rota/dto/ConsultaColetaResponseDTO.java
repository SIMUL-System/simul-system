package com.simulsystem.backend.business.rota.dto;

import java.util.List;

public record ConsultaColetaResponseDTO(
        String cidade,
        String bairro,
        Long rotaId,
        String nomeRota,
        String geometriaGeoJson,
        List<CronogramaResumoDTO> cronogramas
) {
}