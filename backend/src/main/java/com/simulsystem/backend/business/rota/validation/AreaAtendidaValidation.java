package com.simulsystem.backend.business.rota.validation;

import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.core.exception.AreaAtendidaJaCadastradaException;
import org.springframework.stereotype.Component;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.core.exception.AreaAtendidaNaoEncontradaException;

@Component
public class AreaAtendidaValidation {

    private final AreaAtendidaRepository areaAtendidaRepository;

    public AreaAtendidaValidation(
            AreaAtendidaRepository areaAtendidaRepository
    ) {
        this.areaAtendidaRepository = areaAtendidaRepository;
    }

    public void validarAreaNaoCadastrada(
            String cidade,
            String bairro
    ) {
        boolean existe = areaAtendidaRepository
                .existsByCidadeIgnoreCaseAndBairroIgnoreCase(
                        cidade,
                        bairro
                );

        if (existe) {
            throw new AreaAtendidaJaCadastradaException(
                    "Já existe uma área atendida cadastrada para esta cidade e bairro."
            );
        }
    }

    public AreaAtendida buscarAreaAtendidaExistente(
        String cidade,
        String bairro
) {
    return areaAtendidaRepository
            .findByCidadeIgnoreCaseAndBairroIgnoreCase(
                    cidade,
                    bairro
            )
            .orElseThrow(() ->
                    new AreaAtendidaNaoEncontradaException(
                            "Não existe rota cadastrada para a cidade e bairro informados."
                    )
            );
}

}