package com.simulsystem.backend.business.cronograma.validation;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.core.exception.CronogramaNaoEncontradoException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CronogramaValidationLoteTest {

    @Mock
    private CronogramaRepository cronogramaRepository;

    @InjectMocks
    private CronogramaValidation cronogramaValidation;

    @Test
    void deveRetornarCronogramasQuandoTodosExistem() {
        Set<Long> ids = new LinkedHashSet<>(List.of(1L, 2L));
        when(cronogramaRepository.findAllById(ids))
                .thenReturn(List.of(comId(1L), comId(2L)));

        assertEquals(2, cronogramaValidation.buscarCronogramasExistentes(List.of(1L, 2L)).size());
    }

    @Test
    void deveIgnorarIdsRepetidos() {
        Set<Long> ids = new LinkedHashSet<>(List.of(3L));
        when(cronogramaRepository.findAllById(ids))
                .thenReturn(List.of(comId(3L)));

        assertEquals(1, cronogramaValidation.buscarCronogramasExistentes(List.of(3L, 3L)).size());
    }

    @Test
    void deveListarIdsAusentesNaMensagem() {
        Set<Long> ids = new LinkedHashSet<>(List.of(1L, 7L, 9L));
        when(cronogramaRepository.findAllById(ids))
                .thenReturn(List.of(comId(1L)));

        CronogramaNaoEncontradoException erro = assertThrows(
                CronogramaNaoEncontradoException.class,
                () -> cronogramaValidation.buscarCronogramasExistentes(List.of(1L, 7L, 9L))
        );

        assertTrue(erro.getMessage().contains("7, 9"));
    }

    private Cronograma comId(Long id) {
        Cronograma cronograma = new Cronograma();
        cronograma.setId(id);
        return cronograma;
    }
}
