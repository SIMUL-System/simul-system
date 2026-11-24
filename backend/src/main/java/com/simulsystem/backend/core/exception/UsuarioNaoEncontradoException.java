package com.simulsystem.backend.core.exception;

/** Usuário do token não existe mais (vira 404). */
public class UsuarioNaoEncontradoException extends RuntimeException {

    public UsuarioNaoEncontradoException(String message) {
        super(message);
    }
}
