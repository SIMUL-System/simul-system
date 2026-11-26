package com.simulsystem.backend.business.cronograma.validation;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CronogramaValidationTurnoTest {

    private final CronogramaValidation validation =
            new CronogramaValidation(Mockito.mock(CronogramaRepository.class));

    @Test
    void deveAceitarSoOTurnoSemHorario() {
        assertEquals(Turno.NOTURNO, validation.resolverTurno(Turno.NOTURNO, null, null));
    }

    @Test
    void deveDeduzirOTurnoDoHorarioDeInicio() {
        assertEquals(Turno.DIURNO, validation.resolverTurno(null, LocalTime.of(6, 0), LocalTime.of(12, 0)));
        assertEquals(Turno.NOTURNO, validation.resolverTurno(null, LocalTime.of(18, 0), LocalTime.of(23, 59)));
        assertEquals(Turno.NOTURNO, validation.resolverTurno(null, LocalTime.of(2, 0), LocalTime.of(5, 0)));
    }

    @Test
    void deveManterOTurnoInformadoMesmoComHorario() {
        assertEquals(Turno.DIURNO, validation.resolverTurno(Turno.DIURNO, LocalTime.of(17, 0), LocalTime.of(19, 0)));
    }

    @Test
    void deveRecusarColetaSemTurnoESemHorario() {
        assertThrows(HorarioCronogramaInvalidoException.class, () -> validation.resolverTurno(null, null, null));
    }

    @Test
    void deveRecusarSoUmDosHorarios() {
        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> validation.resolverTurno(Turno.DIURNO, LocalTime.of(7, 0), null));
        assertThrows(HorarioCronogramaInvalidoException.class,
                () -> validation.resolverTurno(Turno.DIURNO, null, LocalTime.of(7, 0)));
    }

    @Test
    void deveAceitarDiurnoENoturnoNoMesmoDia() {
        assertDoesNotThrow(() -> validation.validarColetasSemRepeticao(
                List.of(DiaSemana.SEGUNDA, DiaSemana.SEGUNDA), List.of(Turno.DIURNO, Turno.NOTURNO)));
    }

    @Test
    void deveRecusarMesmoDiaETurnoRepetidos() {
        assertThrows(HorarioCronogramaInvalidoException.class, () -> validation.validarColetasSemRepeticao(
                List.of(DiaSemana.SEGUNDA, DiaSemana.SEGUNDA), List.of(Turno.NOTURNO, Turno.NOTURNO)));
    }
}
