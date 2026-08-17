package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
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
    private final CronogramaService cronogramaService;

    private final RotaMapper rotaMapper;
    private final AreaAtendidaMapper areaAtendidaMapper;

    private final RotaValidation rotaValidation;
    private final AreaAtendidaValidation areaAtendidaValidation;

    public RotaServiceImpl(
            RotaRepository rotaRepository,
            AreaAtendidaRepository areaAtendidaRepository,
            CronogramaService cronogramaService,
            RotaMapper rotaMapper,
            AreaAtendidaMapper areaAtendidaMapper,
            RotaValidation rotaValidation,
            AreaAtendidaValidation areaAtendidaValidation
    ) {
        this.rotaRepository = rotaRepository;
        this.areaAtendidaRepository = areaAtendidaRepository;
        this.cronogramaService = cronogramaService;
        this.rotaMapper = rotaMapper;
        this.areaAtendidaMapper = areaAtendidaMapper;
        this.rotaValidation = rotaValidation;
        this.areaAtendidaValidation = areaAtendidaValidation;
    }

    @Override
    public RotaResponseDTO cadastrarRota(
            RotaRequestDTO requestDTO
    ) {
        Rota rota =
                rotaMapper.toEntity(requestDTO);

        Rota rotaSalva =
                rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(
                rotaSalva
        );
    }

    @Override
    public AreaAtendidaResponseDTO cadastrarAreaAtendida(
            AreaAtendidaRequestDTO requestDTO
    ) {
        areaAtendidaValidation.validarAreaNaoCadastrada(
                requestDTO.cidade(),
                requestDTO.bairro()
        );

        Rota rota =
                rotaValidation.buscarRotaExistente(
                        requestDTO.rotaId()
                );

        AreaAtendida areaAtendida =
                areaAtendidaMapper.toEntity(
                        requestDTO,
                        rota
                );

        AreaAtendida areaSalva =
                areaAtendidaRepository.save(
                        areaAtendida
                );

        return areaAtendidaMapper.toResponseDTO(
                areaSalva
        );
    }

    @Override
    public ConsultaColetaResponseDTO consultarPorCidadeEBairro(
            String cidade,
            String bairro
    ) {
        AreaAtendida areaAtendida =
                areaAtendidaValidation
                        .buscarAreaAtendidaComRotaAtiva(
                                cidade,
                                bairro
                        );

        List<Cronograma> cronogramas =
                cronogramaService.buscarAtivosPorRota(
                        areaAtendida
                                .getRota()
                                .getId()
                );

        return rotaMapper.toConsultaColetaResponseDTO(
                areaAtendida,
                cronogramas
        );
    }

    @Override
    public List<RotaResponseDTO> listarRotas() {
        return rotaRepository.findAll()
                .stream()
                .map(rotaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public RotaResponseDTO atualizarRota(
            Long id,
            RotaRequestDTO requestDTO
    ) {
        Rota rota =
                rotaValidation.buscarRotaExistente(id);

        rotaMapper.atualizarEntity(
                rota,
                requestDTO
        );

        Rota rotaAtualizada =
                rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(
                rotaAtualizada
        );
    }

    @Override
    public RotaResponseDTO alterarStatus(
            Long id,
            boolean ativo
    ) {
        Rota rota =
                rotaValidation.buscarRotaExistente(id);

        rota.setAtivo(ativo);

        Rota rotaAtualizada =
                rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(
                rotaAtualizada
        );
    }
}