package com.simulsystem.backend.business.cronograma.validation;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.core.exception.CronogramaJaCadastradoException;
import com.simulsystem.backend.core.exception.CronogramaNaoEncontradoException;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class CronogramaValidation {

    private final CronogramaRepository cronogramaRepository;

    public CronogramaValidation(
            CronogramaRepository cronogramaRepository
    ) {
        this.cronogramaRepository = cronogramaRepository;
    }

    public Cronograma buscarCronogramaExistente(
            Long cronogramaId
    ) {
        return cronogramaRepository.findById(cronogramaId)
                .orElseThrow(() ->
                        new CronogramaNaoEncontradoException(
                                "O cronograma informado não existe."
                        )
                );
    }

    public void validarCronogramaNaoDuplicado(
            Long rotaId,
            DiaSemana diaSemana
    ) {
        boolean existe =
                cronogramaRepository
                        .existsByRotaIdAndDiaSemanaAndAtivoTrue(
                                rotaId,
                                diaSemana
                        );

        if (existe) {
            throw new CronogramaJaCadastradoException(
                    "Já existe um cronograma ativo para esta rota e dia da semana."
            );
        }
    }

    public void validarCronogramaNaoDuplicadoNaAtualizacao(
            Long cronogramaId,
            Long rotaId,
            DiaSemana diaSemana
    ) {
        boolean existe =
                cronogramaRepository
                        .existsByRotaIdAndDiaSemanaAndAtivoTrueAndIdNot(
                                rotaId,
                                diaSemana,
                                cronogramaId
                        );

        if (existe) {
            throw new CronogramaJaCadastradoException(
                    "Já existe outro cronograma ativo para esta rota e dia da semana."
            );
        }
    }

    public void validarHorarios(
            LocalTime horarioInicio,
            LocalTime horarioFim
    ) {
        if (horarioInicio.equals(horarioFim)) {
            throw new HorarioCronogramaInvalidoException(
                    "O horário de início e o horário de fim não podem ser iguais."
            );
        }
    }
}