package com.simulsystem.backend.business.rota.mapper;

import org.springframework.stereotype.Component;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaDisponivelResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaResponseDTO;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;

@Component
public class AreaAtendidaMapper {

    public AreaAtendida toEntity(
            AreaAtendidaRequestDTO requestDTO,
            Rota rota
    ) {
        AreaAtendida areaAtendida =
                new AreaAtendida();

        areaAtendida.setCidade(
                requestDTO.cidade()
        );

        areaAtendida.setBairro(
                requestDTO.bairro()
        );

        areaAtendida.setRota(
                rota
        );

        return areaAtendida;
    }

    public AreaAtendidaResponseDTO toResponseDTO(
            AreaAtendida areaAtendida
    ) {
        boolean possuiGeometria =
                areaAtendida.getGeometriaGeoJson() != null
                        && !areaAtendida
                                .getGeometriaGeoJson()
                                .isBlank();

        return new AreaAtendidaResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getRota().getId(),
                areaAtendida.getRota().getNome(),
                possuiGeometria
        );
    }

    public AreaDisponivelResponseDTO toAreaDisponivelResponseDTO(
            AreaAtendida areaAtendida
    ) {
        return new AreaDisponivelResponseDTO(
                areaAtendida.getCidade(),
                areaAtendida.getBairro()
        );
    }

    public AreaGeometriaResponseDTO toGeometriaResponseDTO(
            AreaAtendida areaAtendida
    ) {
        return new AreaGeometriaResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getGeometriaGeoJson()
        );
    }

    public void updateEntity(
            AreaAtendida areaAtendida,
            AreaAtendidaRequestDTO requestDTO,
            Rota rota
    ) {
        areaAtendida.setCidade(
                requestDTO.cidade()
        );

        areaAtendida.setBairro(
                requestDTO.bairro()
        );

        areaAtendida.setRota(
                rota
        );
    }
}