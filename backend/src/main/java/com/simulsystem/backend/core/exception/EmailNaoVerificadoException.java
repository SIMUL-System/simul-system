package com.simulsystem.backend.core.exception;

/** Login antes de confirmar o e-mail (vira 403). */
public class EmailNaoVerificadoException
        extends RuntimeException {
    public EmailNaoVerificadoException(String message) {
        super(message);
    }
}
