package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
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
    void deveRetornarColetaQuandoExistirCronogramaNoDiaEHorario() {
        configurarCronogramasPadrao();

        // 19/08/2026 é quarta-feira; cronograma de quarta às 19:00
        LocalDateTime dataHora = LocalDateTime.of(2026, 8, 19, 19, 0);

        Optional<LocalDateTime> resultado = cronogramaService.buscarColetaNoHorario(ROTA_ID, dataHora);

        assertEquals(Optional.of(dataHora), resultado);
    }

    @Test
    void deveIgnorarSegundosAoBuscarColetaNoHorario() {
        configurarCronogramasPadrao();

        Optional<LocalDateTime> resultado = cronogramaService.buscarColetaNoHorario(
                        ROTA_ID,
                        LocalDateTime.of(2026, 8, 19, 19, 0, 42)
                );

        assertEquals(Optional.of(LocalDateTime.of(2026, 8, 19, 19, 0)), resultado);
    }

    @Test
    void naoDeveRetornarColetaEmDiaSemCronograma() {
        configurarCronogramasPadrao();

        // 18/08/2026 é terça-feira: sem cronograma
        Optional<LocalDateTime> resultado = cronogramaService.buscarColetaNoHorario(
                        ROTA_ID,
                        LocalDateTime.of(2026, 8, 18, 19, 0)
                );

        assertTrue(resultado.isEmpty());
    }

    @Test
    void naoDeveRetornarColetaEmHorarioDiferenteDoInicio() {
        configurarCronogramasPadrao();

        Optional<LocalDateTime> resultado = cronogramaService.buscarColetaNoHorario(
                        ROTA_ID,
                        LocalDateTime.of(2026, 8, 19, 19, 1)
                );

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveLancarErroQuandoDataHoraDaBuscaForNula() {
        assertThrows(IllegalArgumentException.class, () -> cronogramaService.buscarColetaNoHorario(ROTA_ID, null));
    }

    @Test
    void deveUsarOComecoDoTurnoQuandoAColetaNaoTemHorario() {
        Cronograma quartaNoturna = criarCronograma(DiaSemana.QUARTA, null, null);
        quartaNoturna.setTurno(Turno.NOTURNO);
        Cronograma quintaDiurna = criarCronograma(DiaSemana.QUINTA, null, null);
        quintaDiurna.setTurno(Turno.DIURNO);

        when(cronogramaRepository.findByRotaIdAndAtivoTrue(ROTA_ID)).thenReturn(List.of(quartaNoturna, quintaDiurna));

        // 19/08/2026 quarta: o turno noturno começa (referência) às 18:00
        LocalDateTime quarta18h = LocalDateTime.of(2026, 8, 19, 18, 0);
        assertEquals(Optional.of(quarta18h), cronogramaService.buscarColetaNoHorario(ROTA_ID, quarta18h));
        assertEquals(Optional.of(quartaNoturna), cronogramaService.buscarCronogramaDaColeta(ROTA_ID, quarta18h));

        // 20/08/2026 quinta: diurno às 06:00
        LocalDateTime quinta6h = LocalDateTime.of(2026, 8, 20, 6, 0);
        assertEquals(Optional.of(quinta6h), cronogramaService.buscarColetaNoHorario(ROTA_ID, quinta6h));

        // Nenhum horário inventado: 19:00 de quarta não é coleta.
        assertTrue(cronogramaService.buscarColetaNoHorario(ROTA_ID, LocalDateTime.of(2026, 8, 19, 19, 0)).isEmpty());
    }

    @Test
    void deveEncontrarOsDoisTurnosDoMesmoDia() {
        Cronograma diurna = criarCronograma(DiaSemana.SEGUNDA, null, null);
        diurna.setTurno(Turno.DIURNO);
        Cronograma noturna = criarCronograma(DiaSemana.SEGUNDA, null, null);
        noturna.setTurno(Turno.NOTURNO);

        when(cronogramaRepository.findByRotaIdAndAtivoTrue(ROTA_ID)).thenReturn(List.of(noturna, diurna));

        // 17/08/2026 é segunda-feira
        assertEquals(Optional.of(diurna),
                cronogramaService.buscarCronogramaDaColeta(ROTA_ID, LocalDateTime.of(2026, 8, 17, 6, 0)));
        assertEquals(Optional.of(noturna),
                cronogramaService.buscarCronogramaDaColeta(ROTA_ID, LocalDateTime.of(2026, 8, 17, 18, 0)));
    }

    private void configurarCronogramasPadrao() {
        Cronograma segunda = criarCronograma(DiaSemana.SEGUNDA, LocalTime.of(19, 0), LocalTime.of(1, 0));

        Cronograma quarta = criarCronograma(DiaSemana.QUARTA, LocalTime.of(19, 0), LocalTime.of(1, 0));

        Cronograma sexta = criarCronograma(DiaSemana.SEXTA, LocalTime.of(19, 0), LocalTime.of(1, 0));

        when(cronogramaRepository.findByRotaIdAndAtivoTrue(ROTA_ID)).thenReturn(List.of(segunda, quarta, sexta));
    }

    private Cronograma criarCronograma(DiaSemana diaSemana, LocalTime horarioInicio, LocalTime horarioFim) {
        Cronograma cronograma = new Cronograma();

        cronograma.setDiaSemana(diaSemana);
        cronograma.setHorarioInicio(horarioInicio);
        cronograma.setHorarioFim(horarioFim);
        cronograma.setAtivo(true);

        return cronograma;
    }
}
