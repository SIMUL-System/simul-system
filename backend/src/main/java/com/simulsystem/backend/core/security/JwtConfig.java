package com.simulsystem.backend.core.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

/** Chave HS256 (JWT_SECRET em Base64, mínimo 256 bits) e o codificador/decodificador de JWT. */
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

    /** Decodifica JWT_SECRET e exige pelo menos 256 bits. */
    @Bean
    public SecretKey jwtSecretKey(JwtProperties jwtProperties) {
        byte[] keyBytes;

        try {
            keyBytes = Base64.getDecoder()
                    .decode(jwtProperties.secret());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("JWT_SECRET deve estar em Base64 válido.", exception);
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET deve possuir pelo menos 256 bits.");
        }

        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    /** Assina os tokens com HS256. */
    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return NimbusJwtEncoder
                .withSecretKey(jwtSecretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }

    /** Valida assinatura e validade dos tokens recebidos. */
    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder
                .withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}
