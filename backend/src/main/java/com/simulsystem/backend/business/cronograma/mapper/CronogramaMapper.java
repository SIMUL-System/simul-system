package com.simulsystem.backend.business.cronograma.mapper;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.rota.model.Rota;
import org.springframework.stereotype.Component;

@Component
public class CronogramaMapper {

    public Cronograma toEntity(
            CronogramaRequestDTO requestDTO,
            Rota rota
    ) {
        Cronograma cronograma = new Cronograma();

        cronograma.setRota(rota);
        cronograma.setDiaSemana(requestDTO.diaSemana());
        cronograma.setHorarioInicio(requestDTO.horarioInicio());
        cronograma.setHorarioFim(requestDTO.horarioFim());

        return cronograma;
    }

    public CronogramaResponseDTO toResponseDTO(
            Cronograma cronograma
    ) {
        return new CronogramaResponseDTO(
                cronograma.getId(),
                cronograma.getRota().getId(),
                cronograma.getRota().getNome(),
                cronograma.getDiaSemana(),
                cronograma.getHorarioInicio(),
                cronograma.getHorarioFim(),
                cronograma.getAtivo(),
                cronograma.getDataCriacao(),
                cronograma.getDataAtualizacao()
        );
    }
}