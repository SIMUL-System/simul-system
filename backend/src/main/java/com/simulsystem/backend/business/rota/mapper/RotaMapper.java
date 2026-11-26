package com.simulsystem.backend.business.rota.mapper;

import com.simulsystem.backend.business.cidade.dto.FaixaTurnosDTO;
import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.CronogramaResumoDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;

import org.springframework.stereotype.Component;

import java.util.List;

/** Converte entre Rota e seus DTOs, incluindo a resposta da consulta pública. */
@Component
public class RotaMapper {

    /** Cria a rota da cidade a partir do pedido (sem tipo, é coleta seletiva). */
    public Rota toEntity(RotaRequestDTO requestDTO, Cidade cidade) {
        Rota rota = new Rota();

        rota.setNome(requestDTO.nome());
        rota.setDescricao(requestDTO.descricao());
        rota.setCidade(cidade);
        rota.setTipoColeta(requestDTO.tipoColeta() == null ? TipoColeta.SELETIVA : requestDTO.tipoColeta());

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
                rota.getDataAtualizacao(),
                rota.getCidade() == null ? null : rota.getCidade().getId(),
                rota.getCidade() == null ? null : rota.getCidade().getNome(),
                rota.getTipoColeta(),
                rota.getFonte()
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
                                        cronograma.getHorarioFim(),
                                        cronograma.getTurno()
                                )
                        )
                        .toList();

        return new ConsultaColetaResponseDTO(
                areaAtendida.getNomeCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getRota().getId(),
                areaAtendida.getRota().getNome(),
                areaAtendida.getGeometriaGeoJson(),
                cronogramasResumo,
                areaAtendida.getId(),
                areaAtendida.getRota().getTipoColeta(),
                areaAtendida.getRota().getFonte(),
                areaAtendida.getCidade() == null ? null : FaixaTurnosDTO.de(areaAtendida.getCidade())
        );
    }

    /** Copia nome, descrição e tipo para a rota existente (a cidade não muda). */
    public void atualizarEntity(Rota rota, RotaRequestDTO requestDTO) {
        rota.setNome(requestDTO.nome());
        rota.setDescricao(requestDTO.descricao());

        if (requestDTO.tipoColeta() != null) {
            rota.setTipoColeta(requestDTO.tipoColeta());
        }
    }
}
