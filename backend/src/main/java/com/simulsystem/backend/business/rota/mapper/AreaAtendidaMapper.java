package com.simulsystem.backend.business.rota.mapper;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaDisponivelResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaResponseDTO;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;

import org.springframework.stereotype.Component;

/** Converte entre AreaAtendida e seus DTOs. */
@Component
public class AreaAtendidaMapper {

    /** Cria a área a partir do pedido. */
    public AreaAtendida toEntity(AreaAtendidaRequestDTO requestDTO, Rota rota) {
        AreaAtendida areaAtendida = new AreaAtendida();

        areaAtendida.setCidade(requestDTO.cidade());

        areaAtendida.setBairro(requestDTO.bairro());

        areaAtendida.setRota(rota);

        return areaAtendida;
    }

    /** Monta a resposta do admin, indicando se já existe contorno. */
    public AreaAtendidaResponseDTO toResponseDTO(AreaAtendida areaAtendida) {
        boolean possuiGeometria = areaAtendida.getGeometriaGeoJson() != null
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

    /** Só cidade e bairro, para a lista pública. */
    public AreaDisponivelResponseDTO toAreaDisponivelResponseDTO(AreaAtendida areaAtendida) {
        return new AreaDisponivelResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getCidade(),
                areaAtendida.getBairro()
        );
    }

    /** Monta a resposta do contorno salvo. */
    public AreaGeometriaResponseDTO toGeometriaResponseDTO(AreaAtendida areaAtendida) {
        return new AreaGeometriaResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getGeometriaGeoJson()
        );
    }

    /** Copia cidade, bairro e rota para a área existente. */
    public void atualizarEntity(AreaAtendida areaAtendida, AreaAtendidaRequestDTO requestDTO, Rota rota) {
        areaAtendida.setCidade(requestDTO.cidade());

        areaAtendida.setBairro(requestDTO.bairro());

        areaAtendida.setRota(rota);
    }
}
