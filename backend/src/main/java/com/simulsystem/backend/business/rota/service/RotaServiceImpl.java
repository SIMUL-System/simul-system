package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.mapper.AreaAtendidaMapper;
import com.simulsystem.backend.business.rota.mapper.RotaMapper;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.business.rota.validation.AreaAtendidaValidation;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RotaServiceImpl implements RotaService {

    private final RotaRepository rotaRepository;
    private final AreaAtendidaRepository areaAtendidaRepository;
    private final CronogramaRepository cronogramaRepository;

    private final RotaMapper rotaMapper;
    private final AreaAtendidaMapper areaAtendidaMapper;

    private final RotaValidation rotaValidation;
    private final AreaAtendidaValidation areaAtendidaValidation;

    public RotaServiceImpl(
            RotaRepository rotaRepository,
            AreaAtendidaRepository areaAtendidaRepository,
            CronogramaRepository cronogramaRepository,
            RotaMapper rotaMapper,
            AreaAtendidaMapper areaAtendidaMapper,
            RotaValidation rotaValidation,
            AreaAtendidaValidation areaAtendidaValidation
    ) {
        this.rotaRepository = rotaRepository;
        this.areaAtendidaRepository = areaAtendidaRepository;
        this.cronogramaRepository = cronogramaRepository;
        this.rotaMapper = rotaMapper;
        this.areaAtendidaMapper = areaAtendidaMapper;
        this.rotaValidation = rotaValidation;
        this.areaAtendidaValidation = areaAtendidaValidation;
    }

    @Override
    public RotaResponseDTO cadastrarRota(
            RotaRequestDTO requestDTO
    ) {

        Rota rota = rotaMapper.toEntity(requestDTO);

        Rota rotaSalva = rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(rotaSalva);
    }

    @Override
    public AreaAtendidaResponseDTO cadastrarAreaAtendida(
            AreaAtendidaRequestDTO requestDTO
    ) {

        areaAtendidaValidation.validarAreaNaoCadastrada(
                requestDTO.cidade(),
                requestDTO.bairro()
        );

        Rota rota = rotaValidation.buscarRotaExistente(
                requestDTO.rotaId()
        );

        AreaAtendida areaAtendida =
                areaAtendidaMapper.toEntity(
                        requestDTO,
                        rota
                );

        AreaAtendida areaSalva =
                areaAtendidaRepository.save(areaAtendida);

        return areaAtendidaMapper.toResponseDTO(areaSalva);
    }

    @Override
    public ConsultaColetaResponseDTO consultarPorCidadeEBairro(
            String cidade,
            String bairro
    ) {

        AreaAtendida areaAtendida =
                areaAtendidaValidation.buscarAreaAtendidaExistente(
                        cidade,
                        bairro
                );

        List<Cronograma> cronogramas =
                cronogramaRepository.findByRotaIdAndAtivoTrue(
                        areaAtendida.getRota().getId()
                );

        return rotaMapper.toConsultaColetaResponseDTO(
                areaAtendida,
                cronogramas
        );
    }
}