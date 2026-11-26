package com.simulsystem.backend.business.cronograma.validation;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CronogramaValidationSemanaTest {

    private final CronogramaValidation validation =
            new CronogramaValidation(Mockito.mock(CronogramaRepository.class));

    @Test
    void deveAceitarDiasDiferentes() {
        assertDoesNotThrow(() -> validation.validarDiasSemRepeticao(
                List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA)));
    }

    @Test
    void deveRecusarDiaRepetido() {
        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> validation.validarDiasSemRepeticao(List.of(DiaSemana.SEGUNDA, DiaSemana.SEGUNDA)));
    }
}
