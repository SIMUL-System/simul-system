package com.simulsystem.backend.core.exception;

/**
 * Tentativa de misturar cidades: bairro numa rota de outra cidade ou troca
 * da cidade de uma rota (vira 409).
 */
public class CidadeDivergenteException extends RuntimeException {

    public CidadeDivergenteException(String message) {
        super(message);
    }
}
