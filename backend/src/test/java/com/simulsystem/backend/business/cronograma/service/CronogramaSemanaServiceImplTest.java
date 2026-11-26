package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.DiaColetaDTO;
import com.simulsystem.backend.business.cronograma.dto.SemanaColetaRequestDTO;
import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.cronograma.validation.CronogramaValidation;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Semana da rota com a validação real: dia + turno, horário opcional. */
@ExtendWith(MockitoExtension.class)
class CronogramaSemanaServiceImplTest {

    @Mock
    private CronogramaRepository cronogramaRepository;

    @Mock
    private CronogramaMapper cronogramaMapper;

    @Mock
    private RotaValidation rotaValidation;

    private CronogramaServiceImpl cronogramaService;

    private Rota rota;

    @BeforeEach
    void setUp() {
        cronogramaService = new CronogramaServiceImpl(
                cronogramaRepository, cronogramaMapper, new CronogramaValidation(cronogramaRepository), rotaValidation);

        rota = new Rota();
        rota.setId(7L);
    }

    @Test
    @SuppressWarnings("unchecked")
    void deveAtualizarReativarCriarEDesativarColetasPorDiaETurno() {
        Cronograma segundaDiurna = criar(1L, DiaSemana.SEGUNDA, Turno.DIURNO, true);
        Cronograma quartaDiurnaInativa = criar(2L, DiaSemana.QUARTA, Turno.DIURNO, false);
        Cronograma sextaDiurna = criar(3L, DiaSemana.SEXTA, Turno.DIURNO, true);

        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(rota);
        when(cronogramaRepository.findByRotaId(7L))
                .thenReturn(List.of(segundaDiurna, quartaDiurnaInativa, sextaDiurna));
        when(cronogramaRepository.saveAll(anyList())).thenAnswer(chamada -> chamada.getArgument(0));

        SemanaColetaRequestDTO pedido = new SemanaColetaRequestDTO(List.of(
                // horário conhecido, com segundos: truncado ao minuto
                new DiaColetaDTO(DiaSemana.SEGUNDA, Turno.DIURNO, LocalTime.of(7, 0, 30), LocalTime.of(12, 0)),
                // só o turno: sem horário
                new DiaColetaDTO(DiaSemana.QUARTA, Turno.DIURNO, null, null),
                // mesmo dia, outro turno
                new DiaColetaDTO(DiaSemana.QUARTA, Turno.NOTURNO, null, null)
        ));

        List<?> resposta = cronogramaService.definirSemanaDaRota(7L, pedido);

        assertEquals(3, resposta.size());

        // Segunda diurna: mesmo registro, horário novo.
        assertTrue(segundaDiurna.getAtivo());
        assertEquals(LocalTime.of(7, 0), segundaDiurna.getHorarioInicio());

        // Quarta diurna: registro inativo reaproveitado, agora sem horário.
        assertTrue(quartaDiurnaInativa.getAtivo());
        assertNull(quartaDiurnaInativa.getHorarioInicio());
        assertNull(quartaDiurnaInativa.getHorarioFim());

        // Sexta saiu: desativada antes de salvar as ativas.
        assertFalse(sextaDiurna.getAtivo());
        ArgumentCaptor<List<Cronograma>> desativados = ArgumentCaptor.forClass(List.class);
        verify(cronogramaRepository).saveAllAndFlush(desativados.capture());
        assertEquals(List.of(sextaDiurna), desativados.getValue());

        // Quarta noturna: registro novo, só com o turno.
        ArgumentCaptor<List<Cronograma>> salvos = ArgumentCaptor.forClass(List.class);
        verify(cronogramaRepository).saveAll(salvos.capture());
        Cronograma quartaNoturna = salvos.getValue().stream()
                .filter(cronograma -> cronograma.getTurno() == Turno.NOTURNO)
                .findFirst()
                .orElseThrow();
        assertSame(rota, quartaNoturna.getRota());
        assertEquals(DiaSemana.QUARTA, quartaNoturna.getDiaSemana());
        assertNull(quartaNoturna.getHorarioInicio());
        assertTrue(quartaNoturna.getAtivo());
    }

    @Test
    void deveDeduzirOTurnoPeloHorarioQuandoNaoForInformado() {
        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(rota);
        when(cronogramaRepository.findByRotaId(7L)).thenReturn(List.of());
        when(cronogramaRepository.saveAll(anyList())).thenAnswer(chamada -> chamada.getArgument(0));

        cronogramaService.definirSemanaDaRota(7L, new SemanaColetaRequestDTO(List.of(
                new DiaColetaDTO(DiaSemana.TERCA, null, LocalTime.of(19, 0), LocalTime.of(23, 0)))));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Cronograma>> salvos = ArgumentCaptor.forClass(List.class);
        verify(cronogramaRepository).saveAll(salvos.capture());
        assertEquals(Turno.NOTURNO, salvos.getValue().get(0).getTurno());
    }

    @Test
    void naoDeveSalvarNadaQuandoUmHorarioForInvalido() {
        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(rota);

        SemanaColetaRequestDTO pedido = new SemanaColetaRequestDTO(List.of(
                new DiaColetaDTO(DiaSemana.SEGUNDA, Turno.DIURNO, LocalTime.of(8, 0), LocalTime.of(8, 0))
        ));

        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> cronogramaService.definirSemanaDaRota(7L, pedido));

        verify(cronogramaRepository, never()).saveAll(anyList());
        verify(cronogramaRepository, never()).saveAllAndFlush(anyList());
    }

    @Test
    void naoDeveAceitarColetaSemTurnoESemHorario() {
        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(rota);

        SemanaColetaRequestDTO pedido = new SemanaColetaRequestDTO(List.of(
                new DiaColetaDTO(DiaSemana.SEGUNDA, null, null, null)));

        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> cronogramaService.definirSemanaDaRota(7L, pedido));
        verify(cronogramaRepository, never()).saveAll(anyList());
    }

    @Test
    void naoDeveAceitarOMesmoDiaETurnoDuasVezes() {
        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(rota);

        SemanaColetaRequestDTO pedido = new SemanaColetaRequestDTO(List.of(
                new DiaColetaDTO(DiaSemana.SEGUNDA, Turno.NOTURNO, null, null),
                new DiaColetaDTO(DiaSemana.SEGUNDA, null, LocalTime.of(19, 0), LocalTime.of(22, 0))));

        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> cronogramaService.definirSemanaDaRota(7L, pedido));
        verify(cronogramaRepository, never()).saveAll(anyList());
    }

    private Cronograma criar(Long id, DiaSemana dia, Turno turno, boolean ativo) {
        Cronograma cronograma = new Cronograma();
        cronograma.setId(id);
        cronograma.setRota(rota);
        cronograma.setDiaSemana(dia);
        cronograma.setTurno(turno);
        cronograma.setAtivo(ativo);
        return cronograma;
    }
}
