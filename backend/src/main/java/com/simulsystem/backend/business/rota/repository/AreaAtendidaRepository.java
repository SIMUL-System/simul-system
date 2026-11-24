package com.simulsystem.backend.business.rota.repository;

import com.simulsystem.backend.business.rota.model.AreaAtendida;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Acesso às áreas atendidas. */
public interface AreaAtendidaRepository
        extends JpaRepository<AreaAtendida, Long> {
    Optional<AreaAtendida>
    /** Área do bairro, só se a rota estiver ativa. */
    findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(String cidade, String bairro);

    /** Cidade e bairro já cadastrados? */
    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCase(String cidade, String bairro);

    /** Mesma pergunta, ignorando o próprio registro (edição). */
    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCaseAndIdNot(String cidade, String bairro, Long id);

    List<AreaAtendida>
    /** Áreas de rotas ativas, em ordem de cidade e bairro. */
    findAllByRota_AtivoTrueOrderByCidadeAscBairroAsc();
}
