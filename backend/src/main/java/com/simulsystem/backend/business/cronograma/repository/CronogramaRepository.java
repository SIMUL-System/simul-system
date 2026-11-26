package com.simulsystem.backend.business.cronograma.repository;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso aos cronogramas. */
public interface CronogramaRepository
        extends JpaRepository<Cronograma, Long> {
    /** Horários ativos de uma rota. */
    List<Cronograma> findByRotaIdAndAtivoTrue(Long rotaId);

    /** Todos os horários de uma rota, ativos e inativos. */
    List<Cronograma> findByRotaId(Long rotaId);

    /** Já existe coleta ativa para a rota nesse dia e turno? */
    boolean existsByRotaIdAndDiaSemanaAndTurnoAndAtivoTrue(Long rotaId, DiaSemana diaSemana, Turno turno);

    /** Mesma pergunta, ignorando o próprio registro (edição). */
    boolean existsByRotaIdAndDiaSemanaAndTurnoAndAtivoTrueAndIdNot(
            Long rotaId, DiaSemana diaSemana, Turno turno, Long id);

    /** Coletas ativas das rotas de uma cidade (painel por cidade). */
    List<Cronograma> findByRota_Cidade_IdAndAtivoTrue(Long cidadeId);

    /** Coletas (ativas e inativas) das rotas de uma cidade. */
    List<Cronograma> findByRota_Cidade_IdOrderByRotaIdAscDiaSemanaAsc(Long cidadeId);

    /** Todos os horários ordenados por rota e dia. */
    List<Cronograma> findAllByOrderByRotaIdAscDiaSemanaAsc();
}
