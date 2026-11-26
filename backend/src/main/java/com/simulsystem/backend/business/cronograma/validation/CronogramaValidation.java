package com.simulsystem.backend.business.cronograma.validation;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.core.exception.CronogramaJaCadastradoException;
import com.simulsystem.backend.core.exception.CronogramaNaoEncontradoException;
import com.simulsystem.backend.core.exception.HorarioCronogramaInvalidoException;

import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
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

    /** Impede duas coletas ativas na mesma rota, dia e turno. */
    public void validarCronogramaNaoDuplicado(Long rotaId, DiaSemana diaSemana, Turno turno) {
        boolean existe = cronogramaRepository.existsByRotaIdAndDiaSemanaAndTurnoAndAtivoTrue(rotaId, diaSemana, turno);

        if (existe) {
            throw new CronogramaJaCadastradoException(
                    "Já existe uma coleta ativa para esta rota, dia da semana e turno.");
        }
    }

    /** Mesma regra na edição, ignorando o próprio registro. */
    public void validarCronogramaNaoDuplicadoNaAtualizacao(
            Long cronogramaId, Long rotaId, DiaSemana diaSemana, Turno turno) {
        boolean existe = cronogramaRepository
                        .existsByRotaIdAndDiaSemanaAndTurnoAndAtivoTrueAndIdNot(rotaId, diaSemana, turno, cronogramaId);

        if (existe) {
            throw new CronogramaJaCadastradoException(
                    "Já existe outra coleta ativa para esta rota, dia da semana e turno."
            );
        }
    }

    /**
     * Confere o par de horários e devolve o turno da coleta.
     *
     * <ul>
     *   <li>Início e fim vêm juntos ou ficam os dois vazios (só o turno).</li>
     *   <li>Sem horário, o turno é obrigatório: nada de horário inventado.</li>
     *   <li>Com horário e sem turno, o turno sai do horário de início.</li>
     * </ul>
     */
    public Turno resolverTurno(Turno turno, LocalTime horarioInicio, LocalTime horarioFim) {
        validarParDeHorarios(horarioInicio, horarioFim);

        if (horarioInicio == null) {
            if (turno == null) {
                throw new HorarioCronogramaInvalidoException(
                        "Informe o turno da coleta ou o horário de início e fim.");
            }

            return turno;
        }

        validarHorarios(horarioInicio, horarioFim);

        return Objects.requireNonNullElseGet(turno, () -> Turno.doHorario(horarioInicio));
    }

    /** Início e fim: os dois preenchidos ou os dois vazios. */
    public void validarParDeHorarios(LocalTime horarioInicio, LocalTime horarioFim) {
        if ((horarioInicio == null) != (horarioFim == null)) {
            throw new HorarioCronogramaInvalidoException(
                    "Informe o horário de início e o de fim, ou deixe os dois em branco.");
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

    /** Cada par dia + turno só pode aparecer uma vez na semana enviada. */
    public void validarColetasSemRepeticao(List<DiaSemana> dias, List<Turno> turnos) {
        Set<String> vistos = new LinkedHashSet<>();

        for (int i = 0; i < dias.size(); i++) {
            if (!vistos.add(dias.get(i) + "/" + turnos.get(i))) {
                throw new HorarioCronogramaInvalidoException(
                        "O dia " + dias.get(i).name() + " no turno " + turnos.get(i).getDescricao()
                                + " foi informado mais de uma vez."
                );
            }
        }
    }
}
