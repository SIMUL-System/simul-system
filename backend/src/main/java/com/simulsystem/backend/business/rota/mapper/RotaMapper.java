package com.simulsystem.backend.business.rota.mapper;

import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.model.Rota;
import org.springframework.stereotype.Component;

@Component
public class RotaMapper {

    public Rota toEntity(RotaRequestDTO requestDTO) {
        Rota rota = new Rota();

        rota.setNome(requestDTO.nome());
        rota.setDescricao(requestDTO.descricao());

        return rota;
    }

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
}