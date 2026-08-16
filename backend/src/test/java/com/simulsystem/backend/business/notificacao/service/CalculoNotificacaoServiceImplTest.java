package com.simulsystem.backend.business.notificacao.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CalculoNotificacaoServiceImplTest {

    private CalculoNotificacaoService calculoNotificacaoService;

    @BeforeEach
    void setUp() {
        calculoNotificacaoService =
                new CalculoNotificacaoServiceImpl();
    }

    @Test
    void deveCalcularHorarioDeEnvioComAntecedenciaDeTresHoras() {

        LocalDateTime proximaColeta =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        LocalDateTime resultado =
                calculoNotificacaoService
                        .calcularHorarioEnvio(
                                proximaColeta,
                                3
                        );

        LocalDateTime esperado =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        16,
                        0
                );

        assertEquals(
                esperado,
                resultado
        );
    }

    @Test
    void deveCalcularHorarioDeEnvioNoDiaAnterior() {

        LocalDateTime proximaColeta =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        1,
                        0
                );

        LocalDateTime resultado =
                calculoNotificacaoService
                        .calcularHorarioEnvio(
                                proximaColeta,
                                3
                        );

        LocalDateTime esperado =
                LocalDateTime.of(
                        2026,
                        8,
                        16,
                        22,
                        0
                );

        assertEquals(
                esperado,
                resultado
        );
    }

    @Test
    void deveManterMesmoHorarioQuandoAntecedenciaForZero() {

        LocalDateTime proximaColeta =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        LocalDateTime resultado =
                calculoNotificacaoService
                        .calcularHorarioEnvio(
                                proximaColeta,
                                0
                        );

        assertEquals(
                proximaColeta,
                resultado
        );
    }

    @Test
    void deveLancarExcecaoQuandoProximaColetaForNula() {

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        calculoNotificacaoService
                                .calcularHorarioEnvio(
                                        null,
                                        3
                                )
        );
    }

    @Test
    void deveLancarExcecaoQuandoAntecedenciaForNula() {

        LocalDateTime proximaColeta =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        calculoNotificacaoService
                                .calcularHorarioEnvio(
                                        proximaColeta,
                                        null
                                )
        );
    }

    @Test
    void deveLancarExcecaoQuandoAntecedenciaForNegativa() {

        LocalDateTime proximaColeta =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        calculoNotificacaoService
                                .calcularHorarioEnvio(
                                        proximaColeta,
                                        -1
                                )
        );
    }
}