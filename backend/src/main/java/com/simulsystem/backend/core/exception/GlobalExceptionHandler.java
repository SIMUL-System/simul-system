package com.simulsystem.backend.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ProblemDetail handleCredenciaisInvalidas(
            CredenciaisInvalidasException exception
    ) {
        ProblemDetail problem =
                ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);

        problem.setTitle("Credenciais inválidas");
        problem.setDetail(exception.getMessage());

        return problem;
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ProblemDetail handleUsuarioNaoEncontrado(
            UsuarioNaoEncontradoException exception
    ) {
        ProblemDetail problem =
                ProblemDetail.forStatus(HttpStatus.NOT_FOUND);

        problem.setTitle("Usuário não encontrado");
        problem.setDetail(exception.getMessage());

        return problem;
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

    @ExceptionHandler(AreaAtendidaNaoEncontradaException.class)
    public ProblemDetail handleAreaAtendidaNaoEncontrada(
            AreaAtendidaNaoEncontradaException exception
    ) {
        ProblemDetail problem =
                ProblemDetail.forStatus(HttpStatus.NOT_FOUND);

        problem.setTitle("Área atendida não encontrada");
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

    @ExceptionHandler(CronogramaJaCadastradoException.class)
    public ProblemDetail handleCronogramaJaCadastrado(
            CronogramaJaCadastradoException exception
    ) {
        ProblemDetail problem =
                ProblemDetail.forStatus(HttpStatus.CONFLICT);

        problem.setTitle("Cronograma já cadastrado");
        problem.setDetail(exception.getMessage());

        return problem;
    }

    @ExceptionHandler(HorarioCronogramaInvalidoException.class)
    public ProblemDetail handleHorarioCronogramaInvalido(
            HorarioCronogramaInvalidoException exception
    ) {
        ProblemDetail problem =
                ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problem.setTitle("Horário do cronograma inválido");
        problem.setDetail(exception.getMessage());

        return problem;
    }
    @ExceptionHandler(CronogramaNaoEncontradoException.class)
public ProblemDetail handleCronogramaNaoEncontrado(
        CronogramaNaoEncontradoException exception
) {
    ProblemDetail problem =
            ProblemDetail.forStatus(HttpStatus.NOT_FOUND);

    problem.setTitle("Cronograma não encontrado");
    problem.setDetail(exception.getMessage());

    return problem;
}
}