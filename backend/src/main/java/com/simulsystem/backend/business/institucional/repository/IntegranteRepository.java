package com.simulsystem.backend.business.institucional.repository;

import com.simulsystem.backend.business.institucional.model.Integrante;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso às integrantes da equipe. */
public interface IntegranteRepository extends JpaRepository<Integrante, Long> {

    /** Na ordem escolhida no painel. */
    List<Integrante> findAllByOrderByOrdemAscIdAsc();
}
