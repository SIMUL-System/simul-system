package com.simulsystem.backend.core.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void deveRetornarConflictQuandoEmailJaEstiverCadastrado() {
        EmailJaCadastradoException exception =
                new EmailJaCadastradoException(
                        "Já existe um usuário cadastrado com este e-mail."
                );

        ProblemDetail problem =
                handler.handleEmailJaCadastrado(
                        exception
                );

        assertEquals(
                HttpStatus.CONFLICT.value(),
                problem.getStatus()
        );

        assertEquals(
                "E-mail já cadastrado",
                problem.getTitle()
        );

        assertEquals(
                "Já existe um usuário cadastrado com este e-mail.",
                problem.getDetail()
        );
    }
}