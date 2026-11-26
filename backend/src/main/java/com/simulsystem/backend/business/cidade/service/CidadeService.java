package com.simulsystem.backend.business.cidade.service;

import com.simulsystem.backend.business.cidade.dto.CidadeResponseDTO;

import java.util.List;

/** Cidades atendidas e os números de cada uma para o painel admin. */
public interface CidadeService {

    /** Todas as cidades, em ordem alfabética, com indicadores e pendências. */
    List<CidadeResponseDTO> listarComIndicadores();

    /** Uma cidade com indicadores, ou 404. */
    CidadeResponseDTO buscarComIndicadores(Long id);
}
