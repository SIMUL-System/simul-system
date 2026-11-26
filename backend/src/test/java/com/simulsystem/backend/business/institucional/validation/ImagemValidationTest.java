package com.simulsystem.backend.business.institucional.validation;

import com.simulsystem.backend.core.exception.ConteudoInvalidoException;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ImagemValidationTest {

    private final ImagemValidation validation = new ImagemValidation();

    @Test
    void deveReconhecerJpegPngEWebpPeloConteudo() {
        assertEquals("image/jpeg", validation.validarEDetectarTipo(bytes(0xFF, 0xD8, 0xFF, 0xE0, 0, 0)));
        assertEquals("image/png",
                validation.validarEDetectarTipo(bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0)));
        assertEquals("image/webp",
                validation.validarEDetectarTipo("RIFF\0\0\0\0WEBPVP8 ".getBytes(StandardCharsets.ISO_8859_1)));
    }

    @Test
    void deveRecusarSvgEArquivoVazio() {
        byte[] svg = "<svg xmlns='http://www.w3.org/2000/svg'><script/></svg>".getBytes(StandardCharsets.UTF_8);

        assertThrows(ConteudoInvalidoException.class, () -> validation.validarEDetectarTipo(svg));
        assertThrows(ConteudoInvalidoException.class, () -> validation.validarEDetectarTipo(new byte[0]));
    }

    @Test
    void deveRecusarArquivoAcimaDoLimite() {
        byte[] grande = new byte[ImagemValidation.TAMANHO_MAXIMO + 1];
        grande[0] = (byte) 0xFF;
        grande[1] = (byte) 0xD8;
        grande[2] = (byte) 0xFF;

        assertThrows(ConteudoInvalidoException.class, () -> validation.validarEDetectarTipo(grande));
    }

    private static byte[] bytes(int... valores) {
        byte[] saida = new byte[valores.length];

        for (int i = 0; i < valores.length; i++) {
            saida[i] = (byte) valores[i];
        }

        return saida;
    }
}
