package com.simulsystem.backend.core.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuração do JWT: segredo e validade em segundos. */
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, long expirationSeconds) {

    public JwtProperties {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("A configuração jwt.secret é obrigatória.");
        }

        if (expirationSeconds <= 0) {
            throw new IllegalArgumentException("A expiração do JWT deve ser maior que zero.");
        }
    }
}
