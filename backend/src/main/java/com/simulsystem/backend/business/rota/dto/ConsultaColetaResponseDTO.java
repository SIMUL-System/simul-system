package com.simulsystem.backend.business.rota.dto;

import com.simulsystem.backend.business.rota.model.TipoColeta;

import java.util.List;

/**
 * Resposta da consulta pública: rota, contorno e coletas ativas do bairro.
 * O tipo de coleta diz se a fonte confirma que é a coleta seletiva.
 */
public record ConsultaColetaResponseDTO(
        String cidade,
        String bairro,
        Long rotaId,
        String nomeRota,
        String geometriaGeoJson,
        List<CronogramaResumoDTO> cronogramas,
        Long areaAtendidaId,
        TipoColeta tipoColeta,
        String fonte
) {
}
