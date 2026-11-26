package com.simulsystem.backend.business.cidade.repository;

import com.simulsystem.backend.business.cidade.model.Cidade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso às cidades. */
public interface CidadeRepository extends JpaRepository<Cidade, Long> {

    /** Todas, em ordem alfabética. */
    List<Cidade> findAllByOrderByNomeAsc();
}
