package com.simulsystem.backend.core.exception;

/** E-mail ou senha incorretos, ou conta inativa (vira 401). */
public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException(String message) {
        super(message);
    }
}
