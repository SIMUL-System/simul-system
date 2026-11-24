package com.simulsystem.backend.core.security;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Tokens de uso único enviados por e-mail (confirmação de cadastro e
 * recuperação de senha). Só o hash SHA-256 é gravado no banco: quem ler
 * o banco não consegue usar o link.
 */
@Component
public class TokenSeguro {

    private static final int TAMANHO_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();

    /** Gera um token aleatório de 256 bits, seguro para usar na URL. */
    public String gerar() {
        byte[] bytes = new byte[TAMANHO_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Hash SHA-256 (hexadecimal) do token, que é o valor gravado e buscado no banco. */
    public String hash(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 não está disponível nesta JVM.", exception);
        }
    }
}
