package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DecisaoNotificacaoServiceImplTest {

    @Mock
    private CronogramaService cronogramaService;

    @Mock
    private CalculoNotificacaoService calculoNotificacaoService;

    private DecisaoNotificacaoServiceImpl service;

    private PreferenciaNotificacao preferencia;

    @BeforeEach
    void setUp() {
        service = new DecisaoNotificacaoServiceImpl(
                cronogramaService,
                calculoNotificacaoService
        );

        Rota rota = new Rota();
        rota.setId(1L);

        preferencia = new PreferenciaNotificacao();
        preferencia.setRota(rota);
        preferencia.setAntecedenciaHoras(3);
    }

    @Test
    void deveRetornarTrueQuandoReferenciaForExatamenteHorarioDoLembrete() {
        LocalDateTime referencia =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        LocalDateTime proximaColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);

        LocalDateTime horarioEnvio =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        when(cronogramaService.calcularProximaColeta(1L, referencia))
                .thenReturn(Optional.of(proximaColeta));

        when(calculoNotificacaoService.calcularHorarioEnvio(
                proximaColeta,
                3
        )).thenReturn(horarioEnvio);

        boolean resultado =
                service.estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                );

        assertTrue(resultado);
    }

    @Test
    void deveRetornarTrueQuandoReferenciaEstiverNoMesmoMinuto() {
        LocalDateTime referencia =
                LocalDateTime.of(2026, 8, 17, 16, 0, 37);

        LocalDateTime proximaColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);

        LocalDateTime horarioEnvio =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        when(cronogramaService.calcularProximaColeta(1L, referencia))
                .thenReturn(Optional.of(proximaColeta));

        when(calculoNotificacaoService.calcularHorarioEnvio(
                proximaColeta,
                3
        )).thenReturn(horarioEnvio);

        boolean resultado =
                service.estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                );

        assertTrue(resultado);
    }

    @Test
    void deveRetornarFalseQuandoReferenciaForAntesDoHorarioDoLembrete() {
        LocalDateTime referencia =
                LocalDateTime.of(2026, 8, 17, 15, 59);

        LocalDateTime proximaColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);

        LocalDateTime horarioEnvio =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        when(cronogramaService.calcularProximaColeta(1L, referencia))
                .thenReturn(Optional.of(proximaColeta));

        when(calculoNotificacaoService.calcularHorarioEnvio(
                proximaColeta,
                3
        )).thenReturn(horarioEnvio);

        boolean resultado =
                service.estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                );

        assertFalse(resultado);
    }

    @Test
    void deveRetornarFalseQuandoReferenciaForDepoisDoHorarioDoLembrete() {
        LocalDateTime referencia =
                LocalDateTime.of(2026, 8, 17, 16, 1);

        LocalDateTime proximaColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);

        LocalDateTime horarioEnvio =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        when(cronogramaService.calcularProximaColeta(1L, referencia))
                .thenReturn(Optional.of(proximaColeta));

        when(calculoNotificacaoService.calcularHorarioEnvio(
                proximaColeta,
                3
        )).thenReturn(horarioEnvio);

        boolean resultado =
                service.estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                );

        assertFalse(resultado);
    }

    @Test
    void deveRetornarFalseQuandoNaoExistirProximaColeta() {
        LocalDateTime referencia =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        when(cronogramaService.calcularProximaColeta(1L, referencia))
                .thenReturn(Optional.empty());

        boolean resultado =
                service.estaNoHorarioDoLembrete(
                        preferencia,
                        referencia
                );

        assertFalse(resultado);

        verifyNoInteractions(calculoNotificacaoService);
    }
}