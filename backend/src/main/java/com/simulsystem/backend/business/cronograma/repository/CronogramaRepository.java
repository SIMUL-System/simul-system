package com.simulsystem.backend.business.cronograma.repository;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso aos cronogramas. */
public interface CronogramaRepository
        extends JpaRepository<Cronograma, Long> {
    /** Horários ativos de uma rota. */
    List<Cronograma> findByRotaIdAndAtivoTrue(Long rotaId);

    /** Já existe horário ativo para a rota nesse dia? */
    boolean existsByRotaIdAndDiaSemanaAndAtivoTrue(Long rotaId, DiaSemana diaSemana);

    /** Mesma pergunta, ignorando o próprio registro (edição). */
    boolean existsByRotaIdAndDiaSemanaAndAtivoTrueAndIdNot(Long rotaId, DiaSemana diaSemana, Long id);

    /** Todos os horários ordenados por rota e dia. */
    List<Cronograma> findAllByOrderByRotaIdAscDiaSemanaAsc();
}
