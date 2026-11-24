package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
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

    /**
     * Altera o horário de início e fim de vários cronogramas numa única
     * transação. Mantém rota, dia da semana e status de cada um.
     */
    List<CronogramaResponseDTO> alterarHorariosEmLote(
            CronogramaHorarioLoteRequestDTO requestDTO
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

    /**
     * Retorna a data e hora informadas (truncadas ao minuto) somente se
     * a rota tiver um cronograma ativo começando exatamente nesse dia da
     * semana e horário.
     */
    Optional<LocalDateTime> buscarColetaNoHorario(
            Long rotaId,
            LocalDateTime dataHora
    );
}