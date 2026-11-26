package com.simulsystem.backend.core.exception;

/** Foto ou texto do "Quem somos" fora do formato aceito (vira 400). */
public class ConteudoInvalidoException extends RuntimeException {

    public ConteudoInvalidoException(String message) {
        super(message);
    }
}
