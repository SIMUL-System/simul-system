package com.simulsystem.backend.core.exception;

/**
 * Falha ao entregar um e-mail ao provedor (SMTP ou API).
 * Vira 503 no GlobalExceptionHandler: o pedido era válido, mas o
 * serviço de e-mail não respondeu agora.
 */
public class EnvioEmailException extends RuntimeException {

    public EnvioEmailException(String message, Throwable cause) {
        super(message, cause);
    }

    public EnvioEmailException(String message) {
        super(message);
    }
}
