package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.DiaColetaDTO;
import com.simulsystem.backend.business.cronograma.dto.SemanaColetaRequestDTO;
import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.cronograma.validation.CronogramaValidation;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CronogramaSemanaServiceImplTest {

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
    @SuppressWarnings("unchecked")
    void deveAtualizarReativarCriarEDesativarDiasDaSemana() {
        Rota rota = new Rota();
        rota.setId(7L);

        Cronograma segundaAtiva = criar(1L, rota, DiaSemana.SEGUNDA, true);
        Cronograma quartaInativa = criar(2L, rota, DiaSemana.QUARTA, false);
        Cronograma sextaAtiva = criar(3L, rota, DiaSemana.SEXTA, true);

        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(rota);
        when(cronogramaRepository.findByRotaId(7L)).thenReturn(List.of(segundaAtiva, quartaInativa, sextaAtiva));
        when(cronogramaRepository.saveAll(anyList())).thenAnswer(chamada -> chamada.getArgument(0));

        SemanaColetaRequestDTO pedido = new SemanaColetaRequestDTO(List.of(
                new DiaColetaDTO(DiaSemana.SEGUNDA, LocalTime.of(19, 0, 30), LocalTime.of(23, 59)),
                new DiaColetaDTO(DiaSemana.QUARTA, LocalTime.of(19, 0), LocalTime.of(23, 59)),
                new DiaColetaDTO(DiaSemana.SABADO, LocalTime.of(19, 0), LocalTime.of(23, 59))
        ));

        List<?> resposta = cronogramaService.definirSemanaDaRota(7L, pedido);

        assertEquals(3, resposta.size());

        // Segunda: mesmo registro, horário novo truncado ao minuto.
        assertTrue(segundaAtiva.getAtivo());
        assertEquals(LocalTime.of(19, 0), segundaAtiva.getHorarioInicio());

        // Quarta: registro inativo reaproveitado.
        assertTrue(quartaInativa.getAtivo());
        assertEquals(LocalTime.of(23, 59), quartaInativa.getHorarioFim());

        // Sexta saiu da semana: desativada antes de salvar os ativos.
        assertFalse(sextaAtiva.getAtivo());
        ArgumentCaptor<List<Cronograma>> desativados = ArgumentCaptor.forClass(List.class);
        verify(cronogramaRepository).saveAllAndFlush(desativados.capture());
        assertEquals(List.of(sextaAtiva), desativados.getValue());

        // Sábado: registro novo da mesma rota.
        ArgumentCaptor<List<Cronograma>> salvos = ArgumentCaptor.forClass(List.class);
        verify(cronogramaRepository).saveAll(salvos.capture());
        Cronograma sabado = salvos.getValue().stream()
                .filter(cronograma -> cronograma.getDiaSemana() == DiaSemana.SABADO)
                .findFirst()
                .orElseThrow();
        assertSame(rota, sabado.getRota());
        assertTrue(sabado.getAtivo());
    }

    @Test
    void naoDeveSalvarNadaQuandoUmHorarioForInvalido() {
        when(rotaValidation.buscarRotaExistente(7L)).thenReturn(new Rota());
        doThrow(new HorarioCronogramaInvalidoException("iguais"))
                .when(cronogramaValidation)
                .validarHorarios(LocalTime.of(8, 0), LocalTime.of(8, 0));

        SemanaColetaRequestDTO pedido = new SemanaColetaRequestDTO(List.of(
                new DiaColetaDTO(DiaSemana.SEGUNDA, LocalTime.of(8, 0), LocalTime.of(8, 0))
        ));

        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> cronogramaService.definirSemanaDaRota(7L, pedido));

        verify(cronogramaRepository, never()).saveAll(anyList());
        verify(cronogramaRepository, never()).saveAllAndFlush(anyList());
    }

    private Cronograma criar(Long id, Rota rota, DiaSemana dia, boolean ativo) {
        Cronograma cronograma = new Cronograma();
        cronograma.setId(id);
        cronograma.setRota(rota);
        cronograma.setDiaSemana(dia);
        cronograma.setHorarioInicio(LocalTime.of(6, 0));
        cronograma.setHorarioFim(LocalTime.of(18, 0));
        cronograma.setAtivo(ativo);
        return cronograma;
    }
}
