package com.simulsystem.backend.core.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void deveRetornarConflictQuandoEmailJaEstiverCadastrado() {
        EmailJaCadastradoException exception = new EmailJaCadastradoException(
                        "Já existe um usuário cadastrado com este e-mail."
                );

        ProblemDetail problem = handler.handleEmailJaCadastrado(exception);

        assertEquals(HttpStatus.CONFLICT.value(), problem.getStatus());

        assertEquals("E-mail já cadastrado", problem.getTitle());

        assertEquals("Já existe um usuário cadastrado com este e-mail.", problem.getDetail());
    }

    @Test
    void deveTransformarGeometriaInvalidaEmBadRequest() {
        ProblemDetail problem = handler.handleGeometriaInvalida(
                new GeometriaGeoJsonInvalidaException("A geometria deve ser do tipo Polygon ou MultiPolygon."));

        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.getStatus());
        assertEquals("Geometria inválida", problem.getTitle());
    }

    @Test
    void deveTransformarNavegadorDeOutraContaEmConflict() {
        ProblemDetail problem = handler.handlePushSubscriptionEmUso(
                new PushSubscriptionEmUsoException("Este navegador já está associado a outra conta."));

        assertEquals(HttpStatus.CONFLICT.value(), problem.getStatus());
    }

    @Test
    void deveEsconderCausaTecnicaQuandoEmailFalhar() {
        ProblemDetail problem = handler.handleEnvioEmail(new EnvioEmailException("Connection timed out: smtp.gmail.com:587"));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE.value(), problem.getStatus());
        assertEquals("Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.", problem.getDetail());
    }
}
