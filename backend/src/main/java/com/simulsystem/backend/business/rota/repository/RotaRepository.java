package com.simulsystem.backend.business.rota.repository;

import com.simulsystem.backend.business.rota.model.Rota;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso às rotas. */
public interface RotaRepository extends JpaRepository<Rota, Long> {

    /** Rotas de uma cidade. */
    List<Rota> findByCidade_Id(Long cidadeId);
}
