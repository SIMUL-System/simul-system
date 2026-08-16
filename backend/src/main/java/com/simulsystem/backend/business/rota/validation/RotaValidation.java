package com.simulsystem.backend.business.rota.validation;

import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.core.exception.AreaAtendidaJaCadastradaException;
import com.simulsystem.backend.core.exception.RotaNaoEncontradaException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Component
public class RotaValidation {

    private final RotaRepository rotaRepository;

    public RotaValidation(RotaRepository rotaRepository) {
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
    @ExceptionHandler(AreaAtendidaJaCadastradaException.class)
public ProblemDetail handleAreaAtendidaJaCadastrada(
        AreaAtendidaJaCadastradaException exception
) {
    ProblemDetail problem =
            ProblemDetail.forStatus(HttpStatus.CONFLICT);

    problem.setTitle("Área atendida já cadastrada");
    problem.setDetail(exception.getMessage());

    return problem;
}

@ExceptionHandler(RotaNaoEncontradaException.class)
public ProblemDetail handleRotaNaoEncontrada(
        RotaNaoEncontradaException exception
) {
    ProblemDetail problem =
            ProblemDetail.forStatus(HttpStatus.NOT_FOUND);

    problem.setTitle("Rota não encontrada");
    problem.setDetail(exception.getMessage());

    return problem;
}

}