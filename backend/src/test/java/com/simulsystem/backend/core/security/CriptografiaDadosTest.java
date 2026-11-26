package com.simulsystem.backend.core.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CriptografiaDadosTest {

    private static final String CHAVE = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    private static final String OUTRA_CHAVE = "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=";

    private final CriptografiaDados criptografia = new CriptografiaDados(CHAVE);

    @Test
    void deveCifrarEDecifrarSemGuardarOTextoOriginal() {
        String cifrado = criptografia.cifrar("morador@simul.local");

        assertTrue(cifrado.startsWith("v1:"));
        assertTrue(!cifrado.contains("morador"));
        assertEquals("morador@simul.local", criptografia.decifrar(cifrado));
    }

    @Test
    void mesmoEmailDeveGerarTextosCifradosDiferentes() {
        assertNotEquals(criptografia.cifrar("a@b.com"), criptografia.cifrar("a@b.com"));
    }

    @Test
    void indiceDeveIgnorarMaiusculasEEspacos() {
        assertEquals(criptografia.indiceEmail("a@b.com"), criptografia.indiceEmail("  A@B.COM "));
        assertEquals(64, criptografia.indiceEmail("a@b.com").length());
    }

    @Test
    void indiceDependeDaChave() {
        assertNotEquals(
                criptografia.indiceEmail("a@b.com"),
                new CriptografiaDados(OUTRA_CHAVE).indiceEmail("a@b.com")
        );
    }

    @Test
    void naoDeveDecifrarComOutraChaveNemTextoAlterado() {
        String cifrado = criptografia.cifrar("a@b.com");

        assertThrows(IllegalStateException.class, () -> new CriptografiaDados(OUTRA_CHAVE).decifrar(cifrado));
        assertThrows(IllegalStateException.class,
                () -> criptografia.decifrar(cifrado.substring(0, cifrado.length() - 4) + "AAAA"));
    }

    @Test
    void deveRecusarChaveAusenteOuCurta() {
        assertThrows(IllegalStateException.class, () -> new CriptografiaDados(""));
        assertThrows(IllegalStateException.class, () -> new CriptografiaDados("AAAA"));
    }

    @Test
    void nullContinuaNull() {
        assertNull(criptografia.cifrar(null));
        assertNull(criptografia.decifrar(null));
    }
}
