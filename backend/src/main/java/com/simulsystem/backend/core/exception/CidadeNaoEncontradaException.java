package com.simulsystem.backend.core.exception;

/** Cidade inexistente (vira 404). */
public class CidadeNaoEncontradaException extends RuntimeException {

    public CidadeNaoEncontradaException(String message) {
        super(message);
    }
}
