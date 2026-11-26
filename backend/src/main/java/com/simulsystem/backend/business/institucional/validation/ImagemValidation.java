package com.simulsystem.backend.business.institucional.validation;

import com.simulsystem.backend.core.exception.ConteudoInvalidoException;

import org.springframework.stereotype.Component;

/**
 * Confere a imagem pelo conteúdo do arquivo (assinatura dos primeiros bytes),
 * e não pelo nome ou pelo tipo que o navegador informa. Aceita só JPEG, PNG
 * e WebP; SVG fica de fora porque pode carregar código.
 */
@Component
public class ImagemValidation {

    public static final int TAMANHO_MAXIMO = 3 * 1024 * 1024;

    /** Tipo real da imagem ("image/jpeg", "image/png" ou "image/webp"), ou erro. */
    public String validarEDetectarTipo(byte[] dados) {
        if (dados == null || dados.length == 0) {
            throw new ConteudoInvalidoException("Escolha uma foto para enviar.");
        }

        if (dados.length > TAMANHO_MAXIMO) {
            throw new ConteudoInvalidoException("A foto passa do limite de 3 MB. Envie uma foto menor.");
        }

        if (comeca(dados, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }

        if (comeca(dados, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return "image/png";
        }

        if (dados.length > 12
                && comeca(dados, 'R', 'I', 'F', 'F')
                && dados[8] == 'W' && dados[9] == 'E' && dados[10] == 'B' && dados[11] == 'P') {
            return "image/webp";
        }

        throw new ConteudoInvalidoException("Formato não aceito. Envie uma foto JPG, PNG ou WebP.");
    }

    private boolean comeca(byte[] dados, int... assinatura) {
        if (dados.length < assinatura.length) {
            return false;
        }

        for (int i = 0; i < assinatura.length; i++) {
            if ((dados[i] & 0xFF) != assinatura[i]) {
                return false;
            }
        }

        return true;
    }
}
