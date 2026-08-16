package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;

public interface CronogramaService {

    CronogramaResponseDTO cadastrar(
            CronogramaRequestDTO requestDTO
    );
}