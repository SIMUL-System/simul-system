package com.simulsystem.backend.business.cronograma.service;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.mapper.CronogramaMapper;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.cronograma.validation.CronogramaValidation;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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
    public CronogramaResponseDTO cadastrar(
            CronogramaRequestDTO requestDTO
    ) {

        Rota rota =
                rotaValidation.buscarRotaExistente(
                        requestDTO.rotaId()
                );

        cronogramaValidation.validarCronogramaNaoDuplicado(
                requestDTO.rotaId(),
                requestDTO.diaSemana()
        );

        cronogramaValidation.validarHorarios(
                requestDTO.horarioInicio(),
                requestDTO.horarioFim()
        );

        Cronograma cronograma =
                cronogramaMapper.toEntity(
                        requestDTO,
                        rota
                );

        Cronograma cronogramaSalvo =
                cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(
                cronogramaSalvo
        );
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
    public CronogramaResponseDTO atualizar(
            Long id,
            CronogramaRequestDTO requestDTO
    ) {

        Cronograma cronograma =
                cronogramaValidation
                        .buscarCronogramaExistente(id);

        Rota rota =
                rotaValidation.buscarRotaExistente(
                        requestDTO.rotaId()
                );

        cronogramaValidation
                .validarCronogramaNaoDuplicadoNaAtualizacao(
                        id,
                        requestDTO.rotaId(),
                        requestDTO.diaSemana()
                );

        cronogramaValidation.validarHorarios(
                requestDTO.horarioInicio(),
                requestDTO.horarioFim()
        );

        cronogramaMapper.atualizarEntity(
                cronograma,
                requestDTO,
                rota
        );

        Cronograma cronogramaAtualizado =
                cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(
                cronogramaAtualizado
        );
    }

    @Override
    public CronogramaResponseDTO alterarStatus(
            Long id,
            boolean ativo
    ) {

        Cronograma cronograma =
                cronogramaValidation
                        .buscarCronogramaExistente(id);

        cronograma.setAtivo(ativo);

        Cronograma cronogramaAtualizado =
                cronogramaRepository.save(cronograma);

        return cronogramaMapper.toResponseDTO(
                cronogramaAtualizado
        );
    }

    @Override
    public List<Cronograma> buscarAtivosPorRota(
            Long rotaId
    ) {
        rotaValidation.buscarRotaExistente(rotaId);

        return cronogramaRepository
                .findByRotaIdAndAtivoTrue(rotaId)
                .stream()
                .sorted(
                        Comparator.comparingInt(
                                cronograma ->
                                        cronograma
                                                .getDiaSemana()
                                                .ordinal()
                        )
                )
                .toList();
    }

    @Override
    public Optional<LocalDateTime> calcularProximaColeta(
            Long rotaId,
            LocalDateTime referencia
    ) {
        List<Cronograma> cronogramas =
                buscarAtivosPorRota(rotaId);

        return cronogramas
                .stream()
                .map(cronograma ->
                        calcularProximaOcorrencia(
                                cronograma,
                                referencia
                        )
                )
                .min(LocalDateTime::compareTo);
    }

    @Override
    public Optional<LocalDateTime> buscarColetaNoHorario(
            Long rotaId,
            LocalDateTime dataHora
    ) {
        if (dataHora == null) {
            throw new IllegalArgumentException(
                    "A data e hora da coleta são obrigatórias."
            );
        }

        LocalDateTime dataHoraPorMinuto =
                dataHora.truncatedTo(ChronoUnit.MINUTES);

        LocalTime horario =
                dataHoraPorMinuto.toLocalTime();

        boolean existeColetaNoHorario =
                buscarAtivosPorRota(rotaId)
                        .stream()
                        .anyMatch(cronograma ->
                                converterDiaSemana(
                                        cronograma.getDiaSemana()
                                ) == dataHoraPorMinuto.getDayOfWeek()
                                && cronograma
                                        .getHorarioInicio()
                                        .truncatedTo(ChronoUnit.MINUTES)
                                        .equals(horario)
                        );

        return existeColetaNoHorario
                ? Optional.of(dataHoraPorMinuto)
                : Optional.empty();
    }

    private LocalDateTime calcularProximaOcorrencia(
            Cronograma cronograma,
            LocalDateTime referencia
    ) {
        DayOfWeek diaCronograma =
                converterDiaSemana(
                        cronograma.getDiaSemana()
                );

        int diasAteColeta =
                (
                        diaCronograma.getValue()
                                - referencia
                                .getDayOfWeek()
                                .getValue()
                                + 7
                ) % 7;

        LocalDate dataColeta =
                referencia
                        .toLocalDate()
                        .plusDays(diasAteColeta);

        LocalDateTime proximaOcorrencia =
                LocalDateTime.of(
                        dataColeta,
                        cronograma.getHorarioInicio()
                );

        if (proximaOcorrencia.isBefore(referencia)) {
            proximaOcorrencia =
                    proximaOcorrencia.plusWeeks(1);
        }

        return proximaOcorrencia;
    }

    private DayOfWeek converterDiaSemana(
            DiaSemana diaSemana
    ) {
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