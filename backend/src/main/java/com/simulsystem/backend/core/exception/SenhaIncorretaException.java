package com.simulsystem.backend.core.exception;

/** Senha de confirmação errada numa ação sensível (vira 400). */
public class SenhaIncorretaException extends RuntimeException {

    public SenhaIncorretaException(String message) {
        super(message);
    }
}
