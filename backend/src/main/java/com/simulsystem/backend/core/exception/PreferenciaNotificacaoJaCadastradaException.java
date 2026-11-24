package com.simulsystem.backend.core.exception;

/** O usuário já tem preferência de lembrete (vira 409). */
public class PreferenciaNotificacaoJaCadastradaException
        extends RuntimeException {
    public PreferenciaNotificacaoJaCadastradaException(String message) {
        super(message);
    }
}
