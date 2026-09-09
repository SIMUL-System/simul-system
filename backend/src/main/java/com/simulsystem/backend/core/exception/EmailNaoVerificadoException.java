package com.simulsystem.backend.core.exception;

public class EmailNaoVerificadoException
        extends RuntimeException {

    public EmailNaoVerificadoException(
            String message
    ) {
        super(message);
    }
}