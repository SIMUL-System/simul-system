package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.dto.SemanaColetaRequestDTO;
import com.simulsystem.backend.business.cronograma.model.Cronograma;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/** Regras dos horários de coleta, usadas pelo admin, pela consulta e pelos lembretes. */
public interface CronogramaService {

    /** Cria uma coleta (uma ativa por rota, dia e turno). */
    CronogramaResponseDTO cadastrar(CronogramaRequestDTO requestDTO);

    /** Lista as coletas: todas ou só as das rotas da cidade (cidadeId opcional). */
    List<CronogramaResponseDTO> listar(Long cidadeId);

    /** Edita um horário existente. */
    CronogramaResponseDTO atualizar(Long id, CronogramaRequestDTO requestDTO);

    /**
     * Altera o horário de início e fim de vários cronogramas numa única
     * transação. Mantém rota, dia da semana e status de cada um.
     */
    List<CronogramaResponseDTO> alterarHorariosEmLote(CronogramaHorarioLoteRequestDTO requestDTO);

    /**
     * Define a semana de coleta da rota numa única transação: os dias enviados
     * ficam ativos com o horário informado e os demais dias são desativados.
     * Reaproveita o registro existente de cada dia para manter o histórico.
     */
    List<CronogramaResponseDTO> definirSemanaDaRota(Long rotaId, SemanaColetaRequestDTO requestDTO);

    /** Ativa ou desativa um horário. */
    CronogramaResponseDTO alterarStatus(Long id, boolean ativo);

    /** Horários ativos da rota, de segunda a domingo. */
    List<Cronograma> buscarAtivosPorRota(Long rotaId);

    /**
     * Retorna a data e hora informadas (truncadas ao minuto) somente se
     * a rota tiver uma coleta ativa começando exatamente nesse dia da
     * semana e horário. Coleta sem horário usa o começo de referência do
     * turno ({@link com.simulsystem.backend.business.cronograma.model.Turno}).
     */
    Optional<LocalDateTime> buscarColetaNoHorario(Long rotaId, LocalDateTime dataHora);

    /** A coleta ativa da rota nesse dia e horário (ou turno), para montar o lembrete. */
    Optional<Cronograma> buscarCronogramaDaColeta(Long rotaId, LocalDateTime dataHora);
}
