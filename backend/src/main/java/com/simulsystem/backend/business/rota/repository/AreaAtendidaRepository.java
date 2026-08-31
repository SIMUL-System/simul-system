package com.simulsystem.backend.business.rota.repository;

import com.simulsystem.backend.business.rota.model.AreaAtendida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AreaAtendidaRepository
        extends JpaRepository<AreaAtendida, Long> {

    Optional<AreaAtendida>
    findByCidadeIgnoreCaseAndBairroIgnoreCase(
            String cidade,
            String bairro
    );

    Optional<AreaAtendida>
    findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(
            String cidade,
            String bairro
    );

    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCase(
            String cidade,
            String bairro
    );

    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCaseAndIdNot(
            String cidade,
            String bairro,
            Long id
    );

    List<AreaAtendida>
    findAllByRota_AtivoTrueOrderByCidadeAscBairroAsc();
}