package com.simulsystem.backend.core.exception;

/** Inscrição de navegador inexistente ou já removida (vira 404). */
public class PushSubscriptionNaoEncontradaException extends RuntimeException {

    public PushSubscriptionNaoEncontradaException(String message) {
        super(message);
    }
}
