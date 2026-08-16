package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;

public interface RotaService {

    RotaResponseDTO cadastrarRota(RotaRequestDTO requestDTO);

    AreaAtendidaResponseDTO cadastrarAreaAtendida(
            AreaAtendidaRequestDTO requestDTO
    );

    AreaAtendidaResponseDTO consultarPorCidadeEBairro(
            String cidade,
            String bairro
    );
}