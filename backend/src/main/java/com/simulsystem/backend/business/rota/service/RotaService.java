package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;

import java.util.List;

public interface RotaService {

    RotaResponseDTO cadastrarRota(
            RotaRequestDTO requestDTO
    );

    AreaAtendidaResponseDTO cadastrarAreaAtendida(
            AreaAtendidaRequestDTO requestDTO
    );

    ConsultaColetaResponseDTO consultarPorCidadeEBairro(
            String cidade,
            String bairro
    );

    List<RotaResponseDTO> listarRotas();

    RotaResponseDTO atualizarRota(
            Long id,
            RotaRequestDTO requestDTO
    );
    RotaResponseDTO alterarStatus(
        Long id,
        boolean ativo
);
}