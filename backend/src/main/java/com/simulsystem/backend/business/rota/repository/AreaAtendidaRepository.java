package com.simulsystem.backend.business.rota.repository;

import com.simulsystem.backend.business.rota.model.AreaAtendida;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/** Acesso às áreas atendidas (bairros). A cidade é sempre a da rota. */
public interface AreaAtendidaRepository
        extends JpaRepository<AreaAtendida, Long> {

    /** Área do bairro pelo nome da cidade, só se a rota estiver ativa. */
    Optional<AreaAtendida> findByCidade_NomeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(String cidade, String bairro);

    /** Área de um bairro da cidade, qualquer que seja a rota. */
    Optional<AreaAtendida> findByCidade_IdAndBairroIgnoreCase(Long cidadeId, String bairro);

    /** Bairro já cadastrado na cidade? */
    boolean existsByCidade_IdAndBairroIgnoreCase(Long cidadeId, String bairro);

    /** Mesma pergunta, ignorando o próprio registro (edição). */
    boolean existsByCidade_IdAndBairroIgnoreCaseAndIdNot(Long cidadeId, String bairro, Long id);

    /** Bairros de uma cidade. */
    List<AreaAtendida> findByCidade_Id(Long cidadeId);

    /** Áreas de rotas ativas, em ordem de cidade e bairro (lista pública). */
    @Query("""
            SELECT a FROM AreaAtendida a
            JOIN FETCH a.cidade c
            JOIN a.rota r
            WHERE r.ativo = true
            ORDER BY c.nome, a.bairro
            """)
    List<AreaAtendida> listarDeRotasAtivas();
}
