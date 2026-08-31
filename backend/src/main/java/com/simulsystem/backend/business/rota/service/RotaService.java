package com.simulsystem.backend.business.rota.service;

import java.util.List;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaDisponivelResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaResponseDTO;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;

public interface RotaService {

    RotaResponseDTO cadastrarRota(
            RotaRequestDTO requestDTO
    );

    AreaAtendidaResponseDTO cadastrarAreaAtendida(
            AreaAtendidaRequestDTO requestDTO
    );

    List<AreaAtendidaResponseDTO> listarAreasAtendidas();

    AreaAtendidaResponseDTO atualizarAreaAtendida(
            Long id,
            AreaAtendidaRequestDTO requestDTO
    );

    AreaGeometriaResponseDTO atualizarGeometriaArea(
            Long id,
            AreaGeometriaRequestDTO requestDTO
    );

    List<AreaDisponivelResponseDTO> listarAreasDisponiveis();

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