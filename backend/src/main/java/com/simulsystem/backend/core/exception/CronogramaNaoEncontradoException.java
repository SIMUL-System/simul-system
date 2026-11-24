package com.simulsystem.backend.core.exception;

/** Cronograma inexistente (vira 404). */
public class CronogramaNaoEncontradoException extends RuntimeException {

    public CronogramaNaoEncontradoException(String message) {
        super(message);
    }
}
