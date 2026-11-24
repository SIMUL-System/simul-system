package com.simulsystem.backend.core.exception;

/** Início e fim iguais (vira 400). */
public class HorarioCronogramaInvalidoException extends RuntimeException {

    public HorarioCronogramaInvalidoException(String message) {
        super(message);
    }
}
