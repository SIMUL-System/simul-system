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

        // A cidade do bairro é sempre a da rota.
        areaAtendida.setCidade(rota.getCidade());

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
                areaAtendida.getNomeCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getRota().getId(),
                areaAtendida.getRota().getNome(),
                possuiGeometria,
                areaAtendida.getCidade() == null ? null : areaAtendida.getCidade().getId()
        );
    }

    /** Só cidade e bairro, para a lista pública. */
    public AreaDisponivelResponseDTO toAreaDisponivelResponseDTO(AreaAtendida areaAtendida) {
        return new AreaDisponivelResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getNomeCidade(),
                areaAtendida.getBairro()
        );
    }

    /** Monta a resposta do contorno salvo. */
    public AreaGeometriaResponseDTO toGeometriaResponseDTO(AreaAtendida areaAtendida) {
        return new AreaGeometriaResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getNomeCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getGeometriaGeoJson()
        );
    }

    /** Copia bairro e rota (e a cidade da rota) para a área existente. */
    public void atualizarEntity(AreaAtendida areaAtendida, AreaAtendidaRequestDTO requestDTO, Rota rota) {
        areaAtendida.setCidade(rota.getCidade());

        areaAtendida.setBairro(requestDTO.bairro());

        areaAtendida.setRota(rota);
    }
}
