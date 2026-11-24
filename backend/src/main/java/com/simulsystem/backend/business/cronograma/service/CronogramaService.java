package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.model.Cronograma;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/** Regras dos horários de coleta, usadas pelo admin, pela consulta e pelos lembretes. */
public interface CronogramaService {

    /** Cria um horário (um ativo por rota e dia). */
    CronogramaResponseDTO cadastrar(CronogramaRequestDTO requestDTO);

    /** Lista todos os horários. */
    List<CronogramaResponseDTO> listar();

    /** Edita um horário existente. */
    CronogramaResponseDTO atualizar(Long id, CronogramaRequestDTO requestDTO);

    /**
     * Altera o horário de início e fim de vários cronogramas numa única
     * transação. Mantém rota, dia da semana e status de cada um.
     */
    List<CronogramaResponseDTO> alterarHorariosEmLote(CronogramaHorarioLoteRequestDTO requestDTO);

    /** Ativa ou desativa um horário. */
    CronogramaResponseDTO alterarStatus(Long id, boolean ativo);

    /** Horários ativos da rota, de segunda a domingo. */
    List<Cronograma> buscarAtivosPorRota(Long rotaId);

    /**
     * Retorna a data e hora informadas (truncadas ao minuto) somente se
     * a rota tiver um cronograma ativo começando exatamente nesse dia da
     * semana e horário.
     */
    Optional<LocalDateTime> buscarColetaNoHorario(Long rotaId, LocalDateTime dataHora);
}
