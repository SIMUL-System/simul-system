package com.simulsystem.backend.core.exception;

/** Foto ou integrante do "Quem somos" que não existe (vira 404). */
public class ConteudoNaoEncontradoException extends RuntimeException {

    public ConteudoNaoEncontradoException(String message) {
        super(message);
    }
}
