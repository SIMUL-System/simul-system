package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;

import java.util.List;

public interface CronogramaService {

    CronogramaResponseDTO cadastrar(
            CronogramaRequestDTO requestDTO
    );

    List<CronogramaResponseDTO> listar();
}