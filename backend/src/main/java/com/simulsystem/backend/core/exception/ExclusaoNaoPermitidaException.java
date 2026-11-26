package com.simulsystem.backend.core.exception;

/** Conta que não pode ser excluída pelo próprio usuário, como a do administrador (vira 409). */
public class ExclusaoNaoPermitidaException extends RuntimeException {

    public ExclusaoNaoPermitidaException(String message) {
        super(message);
    }
}
