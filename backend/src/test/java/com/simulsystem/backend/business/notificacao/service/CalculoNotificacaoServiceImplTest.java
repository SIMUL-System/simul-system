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
        calculoNotificacaoService = new CalculoNotificacaoServiceImpl();
    }

    @Test
    void deveLancarExcecaoQuandoAntecedenciaForNula() {
        LocalDateTime proximaColeta = LocalDateTime.of(2026, 8, 17, 19, 0);

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        calculoNotificacaoService
                                .calcularHorarioColetaAlvo(proximaColeta, null)
        );
    }

    @Test
    void deveLancarExcecaoQuandoAntecedenciaForNegativa() {
        LocalDateTime proximaColeta = LocalDateTime.of(2026, 8, 17, 19, 0);

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        calculoNotificacaoService
                                .calcularHorarioColetaAlvo(proximaColeta, -1)
        );
    }

    @Test
    void deveCalcularHorarioDaColetaAlvoSomandoAntecedencia() {
        LocalDateTime resultado = calculoNotificacaoService
                        .calcularHorarioColetaAlvo(LocalDateTime.of(2026, 11, 23, 7, 0), 48);

        assertEquals(LocalDateTime.of(2026, 11, 25, 7, 0), resultado);
    }

    @Test
    void deveTruncarSegundosAoCalcularHorarioDaColetaAlvo() {
        LocalDateTime resultado = calculoNotificacaoService
                        .calcularHorarioColetaAlvo(LocalDateTime.of(2026, 11, 23, 4, 0, 59), 3);

        assertEquals(LocalDateTime.of(2026, 11, 23, 7, 0), resultado);
    }

    @Test
    void deveLancarErroQuandoAntecedenciaDaColetaAlvoForNegativa() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculoNotificacaoService
                        .calcularHorarioColetaAlvo(LocalDateTime.of(2026, 11, 23, 7, 0), -1)
        );
    }

    @Test
    void deveLancarErroQuandoReferenciaDaColetaAlvoForNula() {
        assertThrows(
                IllegalArgumentException.class,
                () -> calculoNotificacaoService
                        .calcularHorarioColetaAlvo(null, 3)
        );
    }
}
