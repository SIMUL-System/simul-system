package com.simulsystem.backend.business.rota.dto;

import com.simulsystem.backend.business.cidade.dto.FaixaTurnosDTO;
import com.simulsystem.backend.business.rota.model.TipoColeta;

import java.util.List;

/**
 * Resposta da consulta pública: rota, contorno e coletas ativas do bairro.
 * O tipo de coleta diz se é a seletiva, a convencional ou não informado, e
 * "turnos" traz a faixa média de cada turno na cidade (horário aproximado).
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
        String fonte,
        FaixaTurnosDTO turnos
) {
}
