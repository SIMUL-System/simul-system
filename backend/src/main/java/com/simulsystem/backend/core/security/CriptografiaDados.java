package com.simulsystem.backend.core.security;

import com.simulsystem.backend.core.util.Textos;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Criptografia dos dados pessoais guardados no banco (hoje, o e-mail).
 *
 * <p>Usa uma chave mestra (variável SIMUL_DADOS_CHAVE, 32 bytes em Base64) e
 * deriva dela duas chaves independentes:
 * <ul>
 *   <li>AES-256-GCM, para guardar o e-mail cifrado (cada gravação usa um IV
 *       aleatório, então o mesmo e-mail nunca gera o mesmo texto);</li>
 *   <li>HMAC-SHA256, para o "índice" do e-mail: um resumo que não pode ser
 *       revertido sem a chave e permite achar a conta no login e impedir
 *       cadastro repetido sem decifrar a tabela inteira.</li>
 * </ul>
 * Sem a chave, quem tiver uma cópia do banco não consegue ler os e-mails.
 */
@Component
public class CriptografiaDados {

    private static final String PREFIXO = "v1:";
    private static final int TAMANHO_IV = 12;
    private static final int TAMANHO_TAG_BITS = 128;

    private final SecretKeySpec chaveCifra;
    private final SecretKeySpec chaveIndice;
    private final SecureRandom aleatorio = new SecureRandom();

    public CriptografiaDados(@Value("${simul.dados.chave:}") String chaveBase64) {
        byte[] mestra = decodificarChave(chaveBase64);

        this.chaveCifra = new SecretKeySpec(hmac(mestra, "simul-email-cifra"), "AES");
        this.chaveIndice = new SecretKeySpec(hmac(mestra, "simul-email-indice"), "HmacSHA256");
    }

    /** Texto → "v1:" + Base64(IV + texto cifrado + etiqueta). Null continua null. */
    public String cifrar(String texto) {
        if (texto == null) {
            return null;
        }

        try {
            byte[] iv = new byte[TAMANHO_IV];
            aleatorio.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, chaveCifra, new GCMParameterSpec(TAMANHO_TAG_BITS, iv));
            byte[] cifrado = cipher.doFinal(texto.getBytes(StandardCharsets.UTF_8));

            byte[] saida = new byte[iv.length + cifrado.length];
            System.arraycopy(iv, 0, saida, 0, iv.length);
            System.arraycopy(cifrado, 0, saida, iv.length, cifrado.length);

            return PREFIXO + Base64.getEncoder().encodeToString(saida);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Não foi possível cifrar o dado.", exception);
        }
    }

    /** Inverso de cifrar. Falha se o texto foi alterado ou cifrado com outra chave. */
    public String decifrar(String valor) {
        if (valor == null) {
            return null;
        }

        if (!valor.startsWith(PREFIXO)) {
            throw new IllegalStateException("Dado sem criptografia encontrado no banco.");
        }

        try {
            byte[] entrada = Base64.getDecoder().decode(valor.substring(PREFIXO.length()));

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    chaveCifra,
                    new GCMParameterSpec(TAMANHO_TAG_BITS, entrada, 0, TAMANHO_IV)
            );
            byte[] texto = cipher.doFinal(entrada, TAMANHO_IV, entrada.length - TAMANHO_IV);

            return new String(texto, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Não foi possível decifrar o dado. Confira a variável SIMUL_DADOS_CHAVE.",
                    exception
            );
        }
    }

    /** Índice do e-mail (HMAC em hexadecimal), sem diferenciar maiúsculas e espaços nas pontas. */
    public String indiceEmail(String email) {
        if (email == null) {
            return null;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(chaveIndice);
            byte[] resumo = mac.doFinal(Textos.normalizarEmail(email).getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(resumo);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Não foi possível gerar o índice do e-mail.", exception);
        }
    }

    private static byte[] decodificarChave(String chaveBase64) {
        if (chaveBase64 == null || chaveBase64.isBlank()) {
            throw new IllegalStateException(
                    "Defina a variável SIMUL_DADOS_CHAVE (32 bytes em Base64) para proteger os e-mails."
            );
        }

        byte[] chave;

        try {
            chave = Base64.getDecoder().decode(chaveBase64.trim());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("SIMUL_DADOS_CHAVE não está em Base64.", exception);
        }

        if (chave.length < 32) {
            throw new IllegalStateException("SIMUL_DADOS_CHAVE precisa ter pelo menos 32 bytes.");
        }

        return chave;
    }

    private static byte[] hmac(byte[] chave, String rotulo) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(chave, "HmacSHA256"));
            return mac.doFinal(rotulo.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Não foi possível preparar as chaves.", exception);
        }
    }
}
