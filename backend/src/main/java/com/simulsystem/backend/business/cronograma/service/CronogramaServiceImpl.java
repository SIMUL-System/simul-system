package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.dto.DiaColetaDTO;
import com.simulsystem.backend.business.cronograma.dto.SemanaColetaRequestDTO;
import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
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
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Implementação de CronogramaService. */
@Service
public class CronogramaServiceImpl implements CronogramaService {

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

        cronogramaValidation.validarCronogramaNaoDuplicado(requestDTO.rotaId(), requestDTO.diaSemana());

        cronogramaValidation.validarHorarios(requestDTO.horarioInicio(), requestDTO.horarioFim());

        Cronograma cronograma = cronogramaMapper.toEntity(requestDTO, rota);

        Cronograma cronogramaSalvo = cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(cronogramaSalvo);
    }

    @Override
    public List<CronogramaResponseDTO> listar() {
        return cronogramaRepository
                .findAllByOrderByRotaIdAscDiaSemanaAsc()
                .stream()
                .map(cronogramaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public CronogramaResponseDTO atualizar(Long id, CronogramaRequestDTO requestDTO) {
        Cronograma cronograma = cronogramaValidation.buscarCronogramaExistente(id);

        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        cronogramaValidation
                .validarCronogramaNaoDuplicadoNaAtualizacao(id, requestDTO.rotaId(), requestDTO.diaSemana());

        cronogramaValidation.validarHorarios(requestDTO.horarioInicio(), requestDTO.horarioFim());

        cronogramaMapper.atualizarEntity(cronograma, requestDTO, rota);

        Cronograma cronogramaAtualizado = cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(cronogramaAtualizado);
    }

    @Override
    @Transactional
    public List<CronogramaResponseDTO> alterarHorariosEmLote(CronogramaHorarioLoteRequestDTO requestDTO) {
        LocalTime horarioInicio = requestDTO.horarioInicio()
                        .truncatedTo(ChronoUnit.MINUTES);

        LocalTime horarioFim = requestDTO.horarioFim()
                        .truncatedTo(ChronoUnit.MINUTES);

        cronogramaValidation.validarHorarios(horarioInicio, horarioFim);

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

        cronogramaValidation.validarDiasSemRepeticao(
                requestDTO.dias().stream().map(DiaColetaDTO::diaSemana).toList()
        );

        Map<DiaSemana, DiaColetaDTO> novaSemana = new EnumMap<>(DiaSemana.class);

        for (DiaColetaDTO dia : requestDTO.dias()) {
            LocalTime inicio = dia.horarioInicio().truncatedTo(ChronoUnit.MINUTES);
            LocalTime fim = dia.horarioFim().truncatedTo(ChronoUnit.MINUTES);

            cronogramaValidation.validarHorarios(inicio, fim);
            novaSemana.put(dia.diaSemana(), new DiaColetaDTO(dia.diaSemana(), inicio, fim));
        }

        List<Cronograma> existentes = cronogramaRepository.findByRotaId(rotaId);

        // Primeiro desativa os dias que saíram, liberando o índice único de "ativo por dia".
        List<Cronograma> desativados = new ArrayList<>();

        for (Cronograma cronograma : existentes) {
            if (cronograma.getAtivo() && !novaSemana.containsKey(cronograma.getDiaSemana())) {
                cronograma.setAtivo(false);
                desativados.add(cronograma);
            }
        }

        cronogramaRepository.saveAllAndFlush(desativados);

        List<Cronograma> ativos = new ArrayList<>();

        for (DiaColetaDTO dia : novaSemana.values()) {
            Cronograma cronograma = escolherRegistroDoDia(existentes, dia.diaSemana());

            if (cronograma == null) {
                cronograma = new Cronograma();
                cronograma.setRota(rota);
                cronograma.setDiaSemana(dia.diaSemana());
            }

            cronograma.setHorarioInicio(dia.horarioInicio());
            cronograma.setHorarioFim(dia.horarioFim());
            cronograma.setAtivo(true);
            ativos.add(cronograma);
        }

        return cronogramaRepository
                .saveAll(ativos)
                .stream()
                .sorted(Comparator.comparingInt(cronograma -> cronograma.getDiaSemana().ordinal()))
                .map(cronogramaMapper::toResponseDTO)
                .toList();
    }

    /** Registro a reaproveitar para o dia: o ativo, senão o inativo mais recente. */
    private Cronograma escolherRegistroDoDia(List<Cronograma> existentes, DiaSemana dia) {
        Cronograma escolhido = null;

        for (Cronograma cronograma : existentes) {
            if (cronograma.getDiaSemana() != dia) {
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
                .sorted(Comparator.comparingInt(cronograma -> cronograma.getDiaSemana().ordinal()))
                .toList();
    }

    @Override
    public Optional<LocalDateTime> buscarColetaNoHorario(Long rotaId, LocalDateTime dataHora) {
        if (dataHora == null) {
            throw new IllegalArgumentException("A data e hora da coleta são obrigatórias.");
        }

        LocalDateTime dataHoraPorMinuto = dataHora.truncatedTo(ChronoUnit.MINUTES);

        LocalTime horario = dataHoraPorMinuto.toLocalTime();

        boolean existeColetaNoHorario = buscarAtivosPorRota(rotaId)
                        .stream()
                        .anyMatch(cronograma ->
                                converterDiaSemana(cronograma.getDiaSemana()) == dataHoraPorMinuto.getDayOfWeek()
                                && cronograma
                                        .getHorarioInicio()
                                        .truncatedTo(ChronoUnit.MINUTES)
                                        .equals(horario)
                        );

        return existeColetaNoHorario
                ? Optional.of(dataHoraPorMinuto)
                : Optional.empty();
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
