package com.simulsystem.backend.business.cronograma.repository;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {

    List<Cronograma> findByRotaIdAndAtivoTrue(Long rotaId);

    boolean existsByRotaIdAndDiaSemanaAndAtivoTrue(
            Long rotaId,
            DiaSemana diaSemana
    );
}