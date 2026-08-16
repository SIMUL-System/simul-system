package com.simulsystem.backend.business.rota.mapper;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import org.springframework.stereotype.Component;

@Component
public class AreaAtendidaMapper {

    public AreaAtendida toEntity(
            AreaAtendidaRequestDTO requestDTO,
            Rota rota
    ) {
        AreaAtendida areaAtendida = new AreaAtendida();

        areaAtendida.setCidade(requestDTO.cidade());
        areaAtendida.setBairro(requestDTO.bairro());
        areaAtendida.setRota(rota);

        return areaAtendida;
    }

    public AreaAtendidaResponseDTO toResponseDTO(
            AreaAtendida areaAtendida
    ) {
        return new AreaAtendidaResponseDTO(
                areaAtendida.getId(),
                areaAtendida.getCidade(),
                areaAtendida.getBairro(),
                areaAtendida.getRota().getId(),
                areaAtendida.getRota().getNome()
        );
    }
}