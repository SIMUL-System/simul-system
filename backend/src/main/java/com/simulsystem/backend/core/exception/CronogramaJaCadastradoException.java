package com.simulsystem.backend.core.exception;

/** Já existe horário ativo para a rota nesse dia (vira 409). */
public class CronogramaJaCadastradoException extends RuntimeException {

    public CronogramaJaCadastradoException(String message) {
        super(message);
    }
}
