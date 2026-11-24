package com.simulsystem.backend.core.exception;

/** Rota inexistente (vira 404). */
public class RotaNaoEncontradaException extends RuntimeException {

    public RotaNaoEncontradaException(String message) {
        super(message);
    }
}
