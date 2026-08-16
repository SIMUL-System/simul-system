package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.cronograma.validation.CronogramaValidation;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CronogramaServiceImplTest {

    private static final Long ROTA_ID = 1L;

    @Mock
    private CronogramaRepository cronogramaRepository;

    @Mock
    private CronogramaMapper cronogramaMapper;

    @Mock
    private CronogramaValidation cronogramaValidation;

    @Mock
    private RotaValidation rotaValidation;

    @InjectMocks
    private CronogramaServiceImpl cronogramaService;

    @Test
    void deveRetornarColetaDoMesmoDiaQuandoAindaNaoChegouOHorario() {

        configurarCronogramasPadrao();

        LocalDateTime referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        14,
                        0
                );

        Optional<LocalDateTime> resultado =
                cronogramaService.calcularProximaColeta(
                        ROTA_ID,
                        referencia
                );

        LocalDateTime esperado =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        assertTrue(resultado.isPresent());
        assertEquals(
                esperado,
                resultado.orElseThrow()
        );
    }

    @Test
    void deveRetornarProximoDiaDeColetaQuandoHorarioDoDiaJaPassou() {

        configurarCronogramasPadrao();

        LocalDateTime referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        1
                );

        Optional<LocalDateTime> resultado =
                cronogramaService.calcularProximaColeta(
                        ROTA_ID,
                        referencia
                );

        LocalDateTime esperado =
                LocalDateTime.of(
                        2026,
                        8,
                        19,
                        19,
                        0
                );

        assertTrue(resultado.isPresent());
        assertEquals(
                esperado,
                resultado.orElseThrow()
        );
    }

    @Test
    void deveVirarSemanaQuandoUltimaColetaDaSemanaJaPassou() {

        configurarCronogramasPadrao();

        LocalDateTime referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        21,
                        20,
                        0
                );

        Optional<LocalDateTime> resultado =
                cronogramaService.calcularProximaColeta(
                        ROTA_ID,
                        referencia
                );

        LocalDateTime esperado =
                LocalDateTime.of(
                        2026,
                        8,
                        24,
                        19,
                        0
                );

        assertTrue(resultado.isPresent());
        assertEquals(
                esperado,
                resultado.orElseThrow()
        );
    }

    @Test
    void deveConsiderarColetaAtualQuandoReferenciaForExatamenteHorarioDeInicio() {

        configurarCronogramasPadrao();

        LocalDateTime referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        Optional<LocalDateTime> resultado =
                cronogramaService.calcularProximaColeta(
                        ROTA_ID,
                        referencia
                );

        LocalDateTime esperado =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        19,
                        0
                );

        assertTrue(resultado.isPresent());
        assertEquals(
                esperado,
                resultado.orElseThrow()
        );
    }

    @Test
    void deveRetornarVazioQuandoNaoExistiremCronogramasAtivos() {

        when(
                cronogramaRepository
                        .findByRotaIdAndAtivoTrue(ROTA_ID)
        ).thenReturn(List.of());

        LocalDateTime referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        16,
                        14,
                        0
                );

        Optional<LocalDateTime> resultado =
                cronogramaService.calcularProximaColeta(
                        ROTA_ID,
                        referencia
                );

        assertTrue(resultado.isEmpty());
    }

    private void configurarCronogramasPadrao() {

        Cronograma segunda =
                criarCronograma(
                        DiaSemana.SEGUNDA,
                        LocalTime.of(19, 0),
                        LocalTime.of(1, 0)
                );

        Cronograma quarta =
                criarCronograma(
                        DiaSemana.QUARTA,
                        LocalTime.of(19, 0),
                        LocalTime.of(1, 0)
                );

        Cronograma sexta =
                criarCronograma(
                        DiaSemana.SEXTA,
                        LocalTime.of(19, 0),
                        LocalTime.of(1, 0)
                );

        when(
                cronogramaRepository
                        .findByRotaIdAndAtivoTrue(ROTA_ID)
        ).thenReturn(
                List.of(
                        segunda,
                        quarta,
                        sexta
                )
        );
    }

    private Cronograma criarCronograma(
            DiaSemana diaSemana,
            LocalTime horarioInicio,
            LocalTime horarioFim
    ) {

        Cronograma cronograma =
                new Cronograma();

        cronograma.setDiaSemana(diaSemana);
        cronograma.setHorarioInicio(horarioInicio);
        cronograma.setHorarioFim(horarioFim);
        cronograma.setAtivo(true);

        return cronograma;
    }
}