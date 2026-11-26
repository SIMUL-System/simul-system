package com.simulsystem.backend.business.institucional.repository;

import com.simulsystem.backend.business.institucional.model.FotoInstituicao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso às fotos da faculdade. */
public interface FotoInstituicaoRepository extends JpaRepository<FotoInstituicao, Long> {

    /** Na ordem escolhida no painel. */
    List<FotoInstituicao> findAllByOrderByOrdemAscIdAsc();
}
