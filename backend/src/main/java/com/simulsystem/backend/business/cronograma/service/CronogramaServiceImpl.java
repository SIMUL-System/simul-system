package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Implementação de CronogramaService. */
@Service
public class CronogramaServiceImpl implements CronogramaService {

    /** Ordem da semana: dia e, no mesmo dia, diurno antes de noturno. */
    private static final Comparator<Cronograma> ORDEM_DA_SEMANA = Comparator
            .comparingInt((Cronograma cronograma) -> cronograma.getDiaSemana().ordinal())
            .thenComparingInt(cronograma -> turnoDe(cronograma).ordinal());

    private final CronogramaRepository cronogramaRepository;
    private final CronogramaMapper cronogramaMapper;
    private final CronogramaValidation cronogramaValidation;
    private final RotaValidation rotaValidation;

    public CronogramaServiceImpl(
            CronogramaRepository cronogramaRepository,
            CronogramaMapper cronogramaMapper,
            CronogramaValidation cronogramaValidation,
            RotaValidation rotaValidation
    ) {
        this.cronogramaRepository = cronogramaRepository;
        this.cronogramaMapper = cronogramaMapper;
        this.cronogramaValidation = cronogramaValidation;
        this.rotaValidation = rotaValidation;
    }

    @Override
    public CronogramaResponseDTO cadastrar(CronogramaRequestDTO requestDTO) {
        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        CronogramaRequestDTO normalizado = normalizar(requestDTO);

        cronogramaValidation.validarCronogramaNaoDuplicado(
                normalizado.rotaId(), normalizado.diaSemana(), normalizado.turno());

        Cronograma cronograma = cronogramaMapper.toEntity(normalizado, rota);

        Cronograma cronogramaSalvo = cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(cronogramaSalvo);
    }

    @Override
    public List<CronogramaResponseDTO> listar(Long cidadeId) {
        List<Cronograma> cronogramas = cidadeId == null
                ? cronogramaRepository.findAllByOrderByRotaIdAscDiaSemanaAsc()
                : cronogramaRepository.findByRota_Cidade_IdOrderByRotaIdAscDiaSemanaAsc(cidadeId);

        return cronogramas
                .stream()
                .map(cronogramaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public CronogramaResponseDTO atualizar(Long id, CronogramaRequestDTO requestDTO) {
        Cronograma cronograma = cronogramaValidation.buscarCronogramaExistente(id);

        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        CronogramaRequestDTO normalizado = normalizar(requestDTO);

        cronogramaValidation.validarCronogramaNaoDuplicadoNaAtualizacao(
                id, normalizado.rotaId(), normalizado.diaSemana(), normalizado.turno());

        cronogramaMapper.atualizarEntity(cronograma, normalizado, rota);

        Cronograma cronogramaAtualizado = cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(cronogramaAtualizado);
    }

    /** Horários por minuto e turno resolvido (informado ou deduzido do horário). */
    private CronogramaRequestDTO normalizar(CronogramaRequestDTO requestDTO) {
        LocalTime inicio = porMinuto(requestDTO.horarioInicio());
        LocalTime fim = porMinuto(requestDTO.horarioFim());
        Turno turno = cronogramaValidation.resolverTurno(requestDTO.turno(), inicio, fim);

        return new CronogramaRequestDTO(requestDTO.rotaId(), requestDTO.diaSemana(), turno, inicio, fim);
    }

    private static LocalTime porMinuto(LocalTime horario) {
        return horario == null ? null : horario.truncatedTo(ChronoUnit.MINUTES);
    }

    @Override
    @Transactional
    public List<CronogramaResponseDTO> alterarHorariosEmLote(CronogramaHorarioLoteRequestDTO requestDTO) {
        LocalTime horarioInicio = porMinuto(requestDTO.horarioInicio());
        LocalTime horarioFim = porMinuto(requestDTO.horarioFim());

        // Os dois vazios: a coleta volta a ter só o turno.
        cronogramaValidation.validarParDeHorarios(horarioInicio, horarioFim);

        if (horarioInicio != null) {
            cronogramaValidation.validarHorarios(horarioInicio, horarioFim);
        }

        List<Cronograma> cronogramas = cronogramaValidation.buscarCronogramasExistentes(requestDTO.ids());

        cronogramas.forEach(cronograma -> {
            cronograma.setHorarioInicio(horarioInicio);
            cronograma.setHorarioFim(horarioFim);
        });

        return cronogramaRepository
                .saveAll(cronogramas)
                .stream()
                .map(cronogramaMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public List<CronogramaResponseDTO> definirSemanaDaRota(Long rotaId, SemanaColetaRequestDTO requestDTO) {
        Rota rota = rotaValidation.buscarRotaExistente(rotaId);

        // Normaliza cada coleta (turno resolvido, horário por minuto).
        Map<String, DiaColetaDTO> novaSemana = new LinkedHashMap<>();
        List<DiaSemana> dias = new ArrayList<>();
        List<Turno> turnos = new ArrayList<>();

        for (DiaColetaDTO dia : requestDTO.dias()) {
            LocalTime inicio = porMinuto(dia.horarioInicio());
            LocalTime fim = porMinuto(dia.horarioFim());
            Turno turno = cronogramaValidation.resolverTurno(dia.turno(), inicio, fim);

            dias.add(dia.diaSemana());
            turnos.add(turno);
            novaSemana.put(chave(dia.diaSemana(), turno), new DiaColetaDTO(dia.diaSemana(), turno, inicio, fim));
        }

        cronogramaValidation.validarColetasSemRepeticao(dias, turnos);

        List<Cronograma> existentes = cronogramaRepository.findByRotaId(rotaId);

        // Primeiro desativa o que saiu, liberando o índice único de "ativo por dia e turno".
        List<Cronograma> desativados = new ArrayList<>();

        for (Cronograma cronograma : existentes) {
            if (cronograma.getAtivo()
                    && !novaSemana.containsKey(chave(cronograma.getDiaSemana(), turnoDe(cronograma)))) {
                cronograma.setAtivo(false);
                desativados.add(cronograma);
            }
        }

        cronogramaRepository.saveAllAndFlush(desativados);

        List<Cronograma> ativos = new ArrayList<>();

        for (DiaColetaDTO dia : novaSemana.values()) {
            Cronograma cronograma = escolherRegistro(existentes, dia.diaSemana(), dia.turno());

            if (cronograma == null) {
                cronograma = new Cronograma();
                cronograma.setRota(rota);
                cronograma.setDiaSemana(dia.diaSemana());
            }

            cronograma.setTurno(dia.turno());

            cronograma.setHorarioInicio(dia.horarioInicio());
            cronograma.setHorarioFim(dia.horarioFim());
            cronograma.setAtivo(true);
            ativos.add(cronograma);
        }

        return cronogramaRepository
                .saveAll(ativos)
                .stream()
                .sorted(ORDEM_DA_SEMANA)
                .map(cronogramaMapper::toResponseDTO)
                .toList();
    }

    /** Turno do registro (registros antigos sem turno: deduzido do horário). */
    private static Turno turnoDe(Cronograma cronograma) {
        return cronograma.getTurno() != null ? cronograma.getTurno() : Turno.doHorario(cronograma.getHorarioInicio());
    }

    private static String chave(DiaSemana dia, Turno turno) {
        return dia.name() + "/" + turno.name();
    }

    /** Registro a reaproveitar para o dia e turno: o ativo, senão o inativo mais recente. */
    private Cronograma escolherRegistro(List<Cronograma> existentes, DiaSemana dia, Turno turno) {
        Cronograma escolhido = null;

        for (Cronograma cronograma : existentes) {
            if (cronograma.getDiaSemana() != dia || turnoDe(cronograma) != turno) {
                continue;
            }

            if (cronograma.getAtivo()) {
                return cronograma;
            }

            if (escolhido == null || cronograma.getId() > escolhido.getId()) {
                escolhido = cronograma;
            }
        }

        return escolhido;
    }

    @Override
    public CronogramaResponseDTO alterarStatus(Long id, boolean ativo) {
        Cronograma cronograma = cronogramaValidation.buscarCronogramaExistente(id);

        if (ativo && !Boolean.TRUE.equals(cronograma.getAtivo())) {
            cronogramaValidation.validarCronogramaNaoDuplicadoNaAtualizacao(
                    id, cronograma.getRota().getId(), cronograma.getDiaSemana(), cronograma.getTurno());
        }

        cronograma.setAtivo(ativo);

        Cronograma cronogramaAtualizado = cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(cronogramaAtualizado);
    }

    @Override
    public List<Cronograma> buscarAtivosPorRota(Long rotaId) {
        rotaValidation.buscarRotaExistente(rotaId);

        return cronogramaRepository
                .findByRotaIdAndAtivoTrue(rotaId)
                .stream()
                .sorted(ORDEM_DA_SEMANA)
                .toList();
    }

    @Override
    public Optional<LocalDateTime> buscarColetaNoHorario(Long rotaId, LocalDateTime dataHora) {
        return buscarCronogramaDaColeta(rotaId, dataHora)
                .map(cronograma -> dataHora.truncatedTo(ChronoUnit.MINUTES));
    }

    @Override
    public Optional<Cronograma> buscarCronogramaDaColeta(Long rotaId, LocalDateTime dataHora) {
        if (dataHora == null) {
            throw new IllegalArgumentException("A data e hora da coleta são obrigatórias.");
        }

        LocalDateTime dataHoraPorMinuto = dataHora.truncatedTo(ChronoUnit.MINUTES);

        LocalTime horario = dataHoraPorMinuto.toLocalTime();

        // Sem horário informado, vale o começo de referência do turno.
        return buscarAtivosPorRota(rotaId)
                .stream()
                .filter(cronograma ->
                        converterDiaSemana(cronograma.getDiaSemana()) == dataHoraPorMinuto.getDayOfWeek()
                        && cronograma
                                .horarioReferencia()
                                .truncatedTo(ChronoUnit.MINUTES)
                                .equals(horario)
                )
                .findFirst();
    }

    private DayOfWeek converterDiaSemana(DiaSemana diaSemana) {
        return switch (diaSemana) {
            case SEGUNDA -> DayOfWeek.MONDAY;
            case TERCA -> DayOfWeek.TUESDAY;
            case QUARTA -> DayOfWeek.WEDNESDAY;
            case QUINTA -> DayOfWeek.THURSDAY;
            case SEXTA -> DayOfWeek.FRIDAY;
            case SABADO -> DayOfWeek.SATURDAY;
            case DOMINGO -> DayOfWeek.SUNDAY;
        };
    }
}
