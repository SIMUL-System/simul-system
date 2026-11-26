package com.simulsystem.backend.core.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

/**
 * Faz o JPA gravar o e-mail cifrado e devolvê-lo decifrado. O resto do sistema
 * (envio de e-mail, tela da conta) continua lendo usuario.getEmail() normalmente.
 */
@Component
@Converter
public class EmailCriptografadoConverter implements AttributeConverter<String, String> {

    private final CriptografiaDados criptografia;

    public EmailCriptografadoConverter(CriptografiaDados criptografia) {
        this.criptografia = criptografia;
    }

    @Override
    public String convertToDatabaseColumn(String email) {
        return criptografia.cifrar(email);
    }

    @Override
    public String convertToEntityAttribute(String valor) {
        return criptografia.decifrar(valor);
    }
}
