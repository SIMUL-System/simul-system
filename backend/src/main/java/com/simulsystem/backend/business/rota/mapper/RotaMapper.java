package com.simulsystem.backend.business.rota.mapper;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.CronogramaResumoDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;

import org.springframework.stereotype.Component;

import java.util.List;

/** Converte entre Rota e seus DTOs, incluindo a resposta da consulta pública. */
@Component
public class RotaMapper {

    /** Cria a rota a partir do pedido. */
    public Rota toEntity(RotaRequestDTO requestDTO) {
        Rota rota = new Rota();

        rota.setNome(requestDTO.nome());
        rota.setDescricao(requestDTO.descricao());

        return rota;
    }

    /** Monta a resposta da rota. */
    public RotaResponseDTO toResponseDTO(Rota rota) {
        return new RotaResponseDTO(
                rota.getId(),
                rota.getNome(),
                rota.getDescricao(),
                rota.getAtivo(),
                rota.getDataCriacao(),
                rota.getDataAtualizacao()
        );
    }

    /** Monta a resposta pública da consulta com os horários ativos. */
    public ConsultaColetaResponseDTO toConsultaColetaResponseDTO(
            AreaAtendida areaAtendida,
            List<Cronograma> cronogramas
    ) {
        List<CronogramaResumoDTO> cronogramasResumo = cronogramas.stream()
                        .map(cronograma ->
                                new CronogramaResumoDTO(
                                        cronograma.getDiaSemana(),
                                        cronograma.getHorarioInicio(),
                                        cronograma.getHorarioFim()
                                )
                        )
                        .toList();

        return new ConsultaColetaResponseDTO(
                areaAtendida.getCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getRota().getId(),
                areaAtendida.getRota().getNome(),
                areaAtendida.getGeometriaGeoJson(),
                cronogramasResumo
        );
    }

    /** Copia nome e descrição para a rota existente. */
    public void atualizarEntity(Rota rota, RotaRequestDTO requestDTO) {
        rota.setNome(requestDTO.nome());
        rota.setDescricao(requestDTO.descricao());
    }
}
