package com.simulsystem.backend.business.cronograma.mapper;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.rota.model.Rota;

import org.springframework.stereotype.Component;

/** Converte entre a entidade Cronograma e seus DTOs. */
@Component
public class CronogramaMapper {

    /** Cria a entidade a partir do pedido. */
    public Cronograma toEntity(CronogramaRequestDTO requestDTO, Rota rota) {
        Cronograma cronograma = new Cronograma();

        cronograma.setRota(rota);
        cronograma.setDiaSemana(requestDTO.diaSemana());
        cronograma.setHorarioInicio(requestDTO.horarioInicio());
        cronograma.setHorarioFim(requestDTO.horarioFim());

        return cronograma;
    }

    /** Monta a resposta do painel admin. */
    public CronogramaResponseDTO toResponseDTO(Cronograma cronograma) {
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

    /** Copia os dados do pedido para a entidade existente. */
    public void atualizarEntity(Cronograma cronograma, CronogramaRequestDTO requestDTO, Rota rota) {
        cronograma.setRota(rota);
        cronograma.setDiaSemana(requestDTO.diaSemana());
        cronograma.setHorarioInicio(requestDTO.horarioInicio());
        cronograma.setHorarioFim(requestDTO.horarioFim());
    }
}
