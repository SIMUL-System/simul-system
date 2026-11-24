package com.simulsystem.backend.core.exception;

/** Cidade e bairro já cadastrados (vira 409). */
public class AreaAtendidaJaCadastradaException extends RuntimeException {

    public AreaAtendidaJaCadastradaException(String message) {
        super(message);
    }
}
