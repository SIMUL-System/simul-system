package com.simulsystem.backend.core.exception;

/** O navegador já está inscrito por outra conta (vira 409). */
public class PushSubscriptionEmUsoException extends RuntimeException {

    public PushSubscriptionEmUsoException(String message) {
        super(message);
    }
}
