package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.cronograma.service.CronogramaServiceImpl;
import com.simulsystem.backend.business.cronograma.validation.CronogramaValidation;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.validation.RotaValidation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

/**
 * Usa o cálculo real (CalculoNotificacaoServiceImpl + CronogramaServiceImpl),
 * simulando apenas o repositório, para cobrir o cenário do bug P0-2:
 * antecedência maior ou igual ao intervalo entre duas coletas da rota.
 *
 * Rota de teste: coleta às 07:00 de segunda, quarta e sexta.
 * Semana de referência: segunda 23/11/2026 a segunda 30/11/2026.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DecisaoNotificacaoServiceImplTest {

    private static final Long ROTA_ID = 1L;

    @Mock
    private CronogramaRepository cronogramaRepository;

    @Mock
    private CronogramaMapper cronogramaMapper;

    @Mock
    private CronogramaValidation cronogramaValidation;

    @Mock
    private RotaValidation rotaValidation;

    private DecisaoNotificacaoServiceImpl service;

    private PreferenciaNotificacao preferencia;

    @BeforeEach
    void setUp() {
        CronogramaServiceImpl cronogramaService = new CronogramaServiceImpl(
                        cronogramaRepository,
                        cronogramaMapper,
                        cronogramaValidation,
                        rotaValidation
                );

        service = new DecisaoNotificacaoServiceImpl(cronogramaService, new CalculoNotificacaoServiceImpl());

        Rota rota = new Rota();
        rota.setId(ROTA_ID);

        preferencia = new PreferenciaNotificacao();
        preferencia.setRota(rota);

        when(cronogramaRepository.findByRotaIdAndAtivoTrue(ROTA_ID))
                .thenReturn(List.of(
                        criarCronograma(DiaSemana.SEGUNDA),
                        criarCronograma(DiaSemana.QUARTA),
                        criarCronograma(DiaSemana.SEXTA)
                ));
    }

    @ParameterizedTest(name = "antecedência {0} h, referência {1} → coleta {2}")
    @CsvSource({
            // antecedência 0: lembrete no próprio horário da coleta
            "0,  2026-11-23T07:00,    2026-11-23T07:00",
            // antecedência pequena, mesmo dia
            "3,  2026-11-23T04:00,    2026-11-23T07:00",
            // segundos na referência são ignorados
            "3,  2026-11-23T04:00:37, 2026-11-23T07:00",
            // lembrete na véspera
            "12, 2026-11-24T19:00,    2026-11-25T07:00",
            // BUG P0-2: 48 h = intervalo seg→qua; na segunda 07:00 a
            // "próxima coleta" é a própria segunda, mas o lembrete é o da quarta
            "48, 2026-11-23T07:00,    2026-11-25T07:00",
            // BUG P0-2: 72 h passando por cima da coleta de quarta
            "72, 2026-11-24T07:00,    2026-11-27T07:00",
            // virada de semana: sexta → segunda seguinte
            "72, 2026-11-27T07:00,    2026-11-30T07:00",
            "48, 2026-11-28T07:00,    2026-11-30T07:00"
    })
    void deveEncontrarColetaCujoLembreteVenceNaReferencia(
            int antecedenciaHoras,
            LocalDateTime referencia,
            LocalDateTime coletaEsperada
    ) {
        preferencia.setAntecedenciaHoras(antecedenciaHoras);

        Optional<LocalDateTime> resultado = service.buscarColetaParaLembrete(preferencia, referencia);

        assertTrue(resultado.isPresent());
        assertEquals(coletaEsperada, resultado.orElseThrow());
    }

    @ParameterizedTest(name = "antecedência {0} h, referência {1} → sem lembrete")
    @CsvSource({
            // um minuto antes e um minuto depois do horário do lembrete
            "12, 2026-11-24T18:59",
            "12, 2026-11-24T19:01",
            // dia sem coleta (terça) com antecedência 0
            "0,  2026-11-24T07:00",
            // 24 h antes de terça (sem coleta)
            "24, 2026-11-23T07:00"
    })
    void naoDeveRetornarColetaForaDoHorarioDoLembrete(int antecedenciaHoras, LocalDateTime referencia) {
        preferencia.setAntecedenciaHoras(antecedenciaHoras);

        Optional<LocalDateTime> resultado = service.buscarColetaParaLembrete(preferencia, referencia);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void naoDeveRetornarColetaQuandoRotaNaoTiverCronogramaAtivo() {
        when(cronogramaRepository.findByRotaIdAndAtivoTrue(ROTA_ID))
                .thenReturn(List.of());

        preferencia.setAntecedenciaHoras(0);

        Optional<LocalDateTime> resultado = service.buscarColetaParaLembrete(
                        preferencia,
                        LocalDateTime.of(2026, 11, 23, 7, 0)
                );

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveLancarErroQuandoPreferenciaForNula() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.buscarColetaParaLembrete(null, LocalDateTime.of(2026, 11, 23, 7, 0))
        );
    }

    @Test
    void deveLancarErroQuandoReferenciaForNula() {
        preferencia.setAntecedenciaHoras(3);

        assertThrows(IllegalArgumentException.class, () -> service.buscarColetaParaLembrete(preferencia, null));
    }

    @Test
    void deveLancarErroQuandoAntecedenciaForNula() {
        preferencia.setAntecedenciaHoras(null);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.buscarColetaParaLembrete(preferencia, LocalDateTime.of(2026, 11, 23, 7, 0))
        );
    }

    private Cronograma criarCronograma(DiaSemana diaSemana) {
        Cronograma cronograma = new Cronograma();

        cronograma.setDiaSemana(diaSemana);
        cronograma.setHorarioInicio(LocalTime.of(7, 0));
        cronograma.setHorarioFim(LocalTime.of(9, 0));
        cronograma.setAtivo(true);

        return cronograma;
    }
}
