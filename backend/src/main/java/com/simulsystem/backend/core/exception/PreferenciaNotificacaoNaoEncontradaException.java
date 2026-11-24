package com.simulsystem.backend.core.exception;

/** O usuário ainda não tem preferência de lembrete (vira 404). */
public class PreferenciaNotificacaoNaoEncontradaException
        extends RuntimeException {
    public PreferenciaNotificacaoNaoEncontradaException(String message) {
        super(message);
    }
}
