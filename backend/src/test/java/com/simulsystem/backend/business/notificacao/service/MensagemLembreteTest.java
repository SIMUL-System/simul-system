package com.simulsystem.backend.business.notificacao.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MensagemLembreteTest {

    private final MensagemLembrete mensagem = new MensagemLembrete();

    @Test
    void deveMontarTextoComNomeRotaEDataDaColeta() {
        String texto = mensagem.texto(
                "Ana", "Senador Canedo - Diurna (seg, qua e sex)", LocalDateTime.of(2026, 11, 25, 6, 0));

        assertEquals(
                "Olá, Ana! A coleta seletiva da rota Senador Canedo - Diurna (seg, qua e sex) "
                        + "está prevista para 25/11/2026 às 06:00.",
                texto);
    }

    @Test
    void deveUsarAssuntoPadrao() {
        assertEquals("SIMUL - Lembrete de coleta seletiva", mensagem.assunto());
    }
}
