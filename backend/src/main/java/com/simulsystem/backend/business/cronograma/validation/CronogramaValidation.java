package com.simulsystem.backend.business.cronograma.validation;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.core.exception.CronogramaJaCadastradoException;
import com.simulsystem.backend.core.exception.CronogramaNaoEncontradoException;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;

import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** Regras de validação dos cronogramas (existência, duplicidade e horários). */
@Component
public class CronogramaValidation {

    private final CronogramaRepository cronogramaRepository;

    public CronogramaValidation(CronogramaRepository cronogramaRepository) {
        this.cronogramaRepository = cronogramaRepository;
    }

    /** Cronograma pelo id ou 404. */
    public Cronograma buscarCronogramaExistente(Long cronogramaId) {
        return cronogramaRepository.findById(cronogramaId)
                .orElseThrow(() ->
                        new CronogramaNaoEncontradoException("O cronograma informado não existe.")
                );
    }

    /** Impede dois horários ativos na mesma rota e dia. */
    public void validarCronogramaNaoDuplicado(Long rotaId, DiaSemana diaSemana) {
        boolean existe = cronogramaRepository.existsByRotaIdAndDiaSemanaAndAtivoTrue(rotaId, diaSemana);

        if (existe) {
            throw new CronogramaJaCadastradoException("Já existe um cronograma ativo para esta rota e dia da semana.");
        }
    }

    /** Mesma regra na edição, ignorando o próprio registro. */
    public void validarCronogramaNaoDuplicadoNaAtualizacao(Long cronogramaId, Long rotaId, DiaSemana diaSemana) {
        boolean existe = cronogramaRepository
                        .existsByRotaIdAndDiaSemanaAndAtivoTrueAndIdNot(rotaId, diaSemana, cronogramaId);

        if (existe) {
            throw new CronogramaJaCadastradoException(
                    "Já existe outro cronograma ativo para esta rota e dia da semana."
            );
        }
    }

    /** Início e fim não podem ser iguais (fim antes do início vale para coleta que vira a noite). */
    public void validarHorarios(LocalTime horarioInicio, LocalTime horarioFim) {
        if (horarioInicio.equals(horarioFim)) {
            throw new HorarioCronogramaInvalidoException(
                    "O horário de início e o horário de fim não podem ser iguais."
            );
        }
    }

    /**
     * Busca todos os cronogramas informados. Se algum não existir,
     * lança exceção listando os identificadores ausentes, para que
     * nenhuma alteração em lote seja aplicada pela metade.
     */
    public List<Cronograma> buscarCronogramasExistentes(List<Long> cronogramaIds) {
        Set<Long> idsUnicos = new LinkedHashSet<>(cronogramaIds);

        List<Cronograma> cronogramas = cronogramaRepository.findAllById(idsUnicos);

        if (cronogramas.size() != idsUnicos.size()) {
            Set<Long> encontrados = cronogramas.stream()
                            .map(Cronograma::getId)
                            .collect(Collectors.toSet());

            String ausentes = idsUnicos.stream()
                            .filter(id -> !encontrados.contains(id))
                            .map(String::valueOf)
                            .collect(Collectors.joining(", "));

            throw new CronogramaNaoEncontradoException("Os seguintes cronogramas não existem: " + ausentes + ".");
        }

        return cronogramas;
    }

    /** Cada dia só pode aparecer uma vez na semana enviada. */
    public void validarDiasSemRepeticao(List<DiaSemana> dias) {
        Set<DiaSemana> vistos = new LinkedHashSet<>();

        for (DiaSemana dia : dias) {
            if (!vistos.add(dia)) {
                throw new HorarioCronogramaInvalidoException(
                        "O dia " + dia.name() + " foi informado mais de uma vez."
                );
            }
        }
    }
}
