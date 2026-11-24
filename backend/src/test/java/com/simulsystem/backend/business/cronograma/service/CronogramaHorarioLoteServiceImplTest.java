package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.cronograma.validation.CronogramaValidation;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.core.exception.CronogramaNaoEncontradoException;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CronogramaHorarioLoteServiceImplTest {

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
    void deveAlterarHorarioDeTodosOsCronogramasMantendoDiaEStatus() {
        Cronograma segunda = criar(DiaSemana.SEGUNDA, true);
        Cronograma quarta = criar(DiaSemana.QUARTA, false);
        List<Cronograma> cronogramas = List.of(segunda, quarta);

        when(cronogramaValidation.buscarCronogramasExistentes(List.of(1L, 2L)))
                .thenReturn(cronogramas);
        when(cronogramaRepository.saveAll(cronogramas))
                .thenReturn(cronogramas);

        CronogramaHorarioLoteRequestDTO pedido =
                new CronogramaHorarioLoteRequestDTO(
                        List.of(1L, 2L),
                        LocalTime.of(19, 0),
                        LocalTime.of(23, 59)
                );

        List<?> resposta = cronogramaService.alterarHorariosEmLote(pedido);

        assertEquals(2, resposta.size());
        for (Cronograma cronograma : cronogramas) {
            assertEquals(LocalTime.of(19, 0), cronograma.getHorarioInicio());
            assertEquals(LocalTime.of(23, 59), cronograma.getHorarioFim());
        }
        assertEquals(DiaSemana.SEGUNDA, segunda.getDiaSemana());
        assertEquals(DiaSemana.QUARTA, quarta.getDiaSemana());
        assertTrue(segunda.getAtivo());
        assertEquals(false, quarta.getAtivo());
    }

    @Test
    void deveDescartarSegundosDoHorarioInformado() {
        Cronograma cronograma = criar(DiaSemana.SEXTA, true);

        when(cronogramaValidation.buscarCronogramasExistentes(List.of(5L)))
                .thenReturn(List.of(cronograma));
        when(cronogramaRepository.saveAll(anyList()))
                .thenReturn(List.of(cronograma));

        cronogramaService.alterarHorariosEmLote(
                new CronogramaHorarioLoteRequestDTO(
                        List.of(5L),
                        LocalTime.of(6, 30, 45),
                        LocalTime.of(18, 0, 10)
                )
        );

        assertEquals(LocalTime.of(6, 30), cronograma.getHorarioInicio());
        assertEquals(LocalTime.of(18, 0), cronograma.getHorarioFim());
    }

    @Test
    void naoDeveSalvarNadaQuandoHorariosForemInvalidos() {
        doThrow(new HorarioCronogramaInvalidoException("iguais"))
                .when(cronogramaValidation)
                .validarHorarios(LocalTime.of(8, 0), LocalTime.of(8, 0));

        assertThrows(
                HorarioCronogramaInvalidoException.class,
                () -> cronogramaService.alterarHorariosEmLote(
                        new CronogramaHorarioLoteRequestDTO(
                                List.of(1L),
                                LocalTime.of(8, 0),
                                LocalTime.of(8, 0)
                        )
                )
        );

        verify(cronogramaValidation, never()).buscarCronogramasExistentes(anyList());
        verify(cronogramaRepository, never()).saveAll(any());
    }

    @Test
    void naoDeveSalvarNadaQuandoAlgumCronogramaNaoExistir() {
        when(cronogramaValidation.buscarCronogramasExistentes(List.of(1L, 99L)))
                .thenThrow(new CronogramaNaoEncontradoException("99"));

        assertThrows(
                CronogramaNaoEncontradoException.class,
                () -> cronogramaService.alterarHorariosEmLote(
                        new CronogramaHorarioLoteRequestDTO(
                                List.of(1L, 99L),
                                LocalTime.of(6, 0),
                                LocalTime.of(18, 0)
                        )
                )
        );

        verify(cronogramaRepository, never()).saveAll(any());
    }

    private Cronograma criar(DiaSemana diaSemana, boolean ativo) {
        Cronograma cronograma = new Cronograma();
        cronograma.setDiaSemana(diaSemana);
        cronograma.setHorarioInicio(LocalTime.of(6, 0));
        cronograma.setHorarioFim(LocalTime.of(18, 0));
        cronograma.setAtivo(ativo);
        return cronograma;
    }
}
