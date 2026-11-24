package com.simulsystem.backend.core.exception;

/** E-mail já usado por outra conta (vira 409). */
public class EmailJaCadastradoException extends RuntimeException {

    public EmailJaCadastradoException(String message) {
        super(message);
    }
}
