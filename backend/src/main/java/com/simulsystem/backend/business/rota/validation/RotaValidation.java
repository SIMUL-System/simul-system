package com.simulsystem.backend.business.rota.validation;

import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.core.exception.RotaNaoEncontradaException;
import org.springframework.stereotype.Component;

@Component
public class RotaValidation {

    private final RotaRepository rotaRepository;

    public RotaValidation(
            RotaRepository rotaRepository
    ) {
        this.rotaRepository = rotaRepository;
    }

    public Rota buscarRotaExistente(Long rotaId) {
        return rotaRepository.findById(rotaId)
                .orElseThrow(() ->
                        new RotaNaoEncontradaException(
                                "A rota informada não existe."
                        )
                );
    }
}