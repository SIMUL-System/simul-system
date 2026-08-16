package com.simulsystem.backend.business.rota.mapper;

import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.model.Rota;
import org.springframework.stereotype.Component;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.CronogramaResumoDTO;
import com.simulsystem.backend.business.rota.model.AreaAtendida;

import java.util.List;

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

    public ConsultaColetaResponseDTO toConsultaColetaResponseDTO(
        AreaAtendida areaAtendida,
        List<Cronograma> cronogramas
) {
    List<CronogramaResumoDTO> cronogramasResumo =
            cronogramas.stream()
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
            cronogramasResumo
    );
}
}