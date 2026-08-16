package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.model.Cronograma;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CronogramaService {

    CronogramaResponseDTO cadastrar(
            CronogramaRequestDTO requestDTO
    );

    List<CronogramaResponseDTO> listar();

    CronogramaResponseDTO atualizar(
            Long id,
            CronogramaRequestDTO requestDTO
    );

    CronogramaResponseDTO alterarStatus(
            Long id,
            boolean ativo
    );

    List<Cronograma> buscarAtivosPorRota(
            Long rotaId
    );

    Optional<LocalDateTime> calcularProximaColeta(
            Long rotaId,
            LocalDateTime referencia
    );
}