package com.simulsystem.backend.business.rota.repository;

import com.simulsystem.backend.business.rota.model.AreaAtendida;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Acesso às áreas atendidas. */
public interface AreaAtendidaRepository
        extends JpaRepository<AreaAtendida, Long> {
    /** Área do bairro, só se a rota estiver ativa. */
    Optional<AreaAtendida> findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(String cidade, String bairro);

    /** Área de um bairro, qualquer que seja a rota. */
    Optional<AreaAtendida> findByCidadeIgnoreCaseAndBairroIgnoreCase(String cidade, String bairro);

    /** Cidade e bairro já cadastrados? */
    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCase(String cidade, String bairro);

    /** Mesma pergunta, ignorando o próprio registro (edição). */
    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCaseAndIdNot(String cidade, String bairro, Long id);

    /** Áreas de rotas ativas, em ordem de cidade e bairro. */
    List<AreaAtendida> findAllByRota_AtivoTrueOrderByCidadeAscBairroAsc();
}
