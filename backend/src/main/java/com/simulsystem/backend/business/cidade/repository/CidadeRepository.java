package com.simulsystem.backend.business.cidade.repository;

import com.simulsystem.backend.business.cidade.model.Cidade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Acesso às cidades. */
public interface CidadeRepository extends JpaRepository<Cidade, Long> {

    /** Cidade pelo nome, sem diferenciar maiúsculas. */
    Optional<Cidade> findByNomeIgnoreCase(String nome);

    /** Todas, em ordem alfabética. */
    List<Cidade> findAllByOrderByNomeAsc();
}
