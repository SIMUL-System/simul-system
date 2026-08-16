package com.simulsystem.backend.business.rota.repository;

import com.simulsystem.backend.business.rota.model.AreaAtendida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AreaAtendidaRepository extends JpaRepository<AreaAtendida, Long> {

    Optional<AreaAtendida> findByCidadeIgnoreCaseAndBairroIgnoreCase(
            String cidade,
            String bairro
    );

    boolean existsByCidadeIgnoreCaseAndBairroIgnoreCase(
            String cidade,
            String bairro
    );
}