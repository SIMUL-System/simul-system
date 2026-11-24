package com.simulsystem.backend.core.exception;

/** Área inexistente ou sem rota ativa (vira 404). */
public class AreaAtendidaNaoEncontradaException extends RuntimeException {

    public AreaAtendidaNaoEncontradaException(String message) {
        super(message);
    }
}
