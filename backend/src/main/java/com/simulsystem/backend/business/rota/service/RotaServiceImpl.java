package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaDisponivelResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaResponseDTO;
import com.simulsystem.backend.business.rota.dto.BairrosRotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.BairrosRotaResponseDTO;
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
import com.simulsystem.backend.core.util.Textos;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Implementação de RotaService. */
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
    public RotaResponseDTO cadastrarRota(RotaRequestDTO requestDTO) {
        Rota rota = rotaMapper.toEntity(requestDTO);

        Rota rotaSalva = rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(rotaSalva);
    }

    @Override
    public AreaAtendidaResponseDTO cadastrarAreaAtendida(AreaAtendidaRequestDTO requestDTO) {
        areaAtendidaValidation.validarAreaNaoCadastrada(requestDTO.cidade(), requestDTO.bairro());

        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        AreaAtendida areaAtendida = areaAtendidaMapper.toEntity(requestDTO, rota);

        AreaAtendida areaSalva = areaAtendidaRepository.save(areaAtendida);

        return areaAtendidaMapper.toResponseDTO(areaSalva);
    }

    @Override
    public List<AreaAtendidaResponseDTO> listarAreasAtendidas() {
        return areaAtendidaRepository
                .findAll()
                .stream()
                .map(areaAtendidaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public AreaAtendidaResponseDTO atualizarAreaAtendida(Long id, AreaAtendidaRequestDTO requestDTO) {
        AreaAtendida areaAtendida = areaAtendidaValidation.buscarPorId(id);

        areaAtendidaValidation.validarAreaNaoCadastradaParaOutroRegistro(id, requestDTO.cidade(), requestDTO.bairro());

        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        areaAtendidaMapper.atualizarEntity(areaAtendida, requestDTO, rota);

        AreaAtendida areaAtualizada = areaAtendidaRepository.save(areaAtendida);

        return areaAtendidaMapper.toResponseDTO(areaAtualizada);
    }

    @Override
    @Transactional
    public AreaGeometriaResponseDTO atualizarGeometriaArea(Long id, AreaGeometriaRequestDTO requestDTO) {
        AreaAtendida areaAtendida = areaAtendidaValidation.buscarPorId(id);

        areaAtendidaValidation.validarGeometriaGeoJson(requestDTO.geometriaGeoJson());

        areaAtendida.setGeometriaGeoJson(requestDTO.geometriaGeoJson());

        AreaAtendida areaAtualizada = areaAtendidaRepository.save(areaAtendida);

        return areaAtendidaMapper.toGeometriaResponseDTO(areaAtualizada);
    }

    @Override
    public List<AreaDisponivelResponseDTO> listarAreasDisponiveis() {
        return areaAtendidaRepository
                .findAllByRota_AtivoTrueOrderByCidadeAscBairroAsc()
                .stream()
                .map(areaAtendidaMapper::toAreaDisponivelResponseDTO)
                .toList();
    }

    @Override
    public ConsultaColetaResponseDTO consultarPorCidadeEBairro(String cidade, String bairro) {
        AreaAtendida areaAtendida = areaAtendidaValidation.buscarAreaAtendidaComRotaAtiva(cidade, bairro);

        List<Cronograma> cronogramas = cronogramaService.buscarAtivosPorRota(areaAtendida.getRota().getId());

        return rotaMapper.toConsultaColetaResponseDTO(areaAtendida, cronogramas);
    }

    @Override
    public List<RotaResponseDTO> listarRotas() {
        return rotaRepository
                .findAll()
                .stream()
                .map(rotaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public RotaResponseDTO atualizarRota(Long id, RotaRequestDTO requestDTO) {
        Rota rota = rotaValidation.buscarRotaExistente(id);

        rotaMapper.atualizarEntity(rota, requestDTO);

        Rota rotaAtualizada = rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(rotaAtualizada);
    }

    @Override
    public RotaResponseDTO alterarStatus(Long id, boolean ativo) {
        Rota rota = rotaValidation.buscarRotaExistente(id);

        rota.setAtivo(ativo);

        Rota rotaAtualizada = rotaRepository.save(rota);

        return rotaMapper.toResponseDTO(rotaAtualizada);
    }

    @Override
    @Transactional
    public BairrosRotaResponseDTO adicionarBairrosNaRota(Long rotaId, BairrosRotaRequestDTO requestDTO) {
        Rota rota = rotaValidation.buscarRotaExistente(rotaId);

        String cidade = Textos.normalizarEspacos(requestDTO.cidade());

        List<String> cadastrados = new ArrayList<>();
        List<String> movidos = new ArrayList<>();
        List<String> jaEstavamNaRota = new ArrayList<>();

        for (String bairro : removerRepetidos(requestDTO.bairros())) {
            AreaAtendida area = areaAtendidaRepository
                    .findByCidadeIgnoreCaseAndBairroIgnoreCase(cidade, bairro)
                    .orElse(null);

            if (area == null) {
                AreaAtendida nova = new AreaAtendida();
                nova.setCidade(cidade);
                nova.setBairro(bairro);
                nova.setRota(rota);
                areaAtendidaRepository.save(nova);
                cadastrados.add(bairro);
            } else if (area.getRota().getId().equals(rotaId)) {
                jaEstavamNaRota.add(area.getBairro());
            } else {
                area.setRota(rota);
                areaAtendidaRepository.save(area);
                movidos.add(area.getBairro());
            }
        }

        return new BairrosRotaResponseDTO(cadastrados, movidos, jaEstavamNaRota);
    }

    /** Tira espaços extras e repetições (sem diferenciar maiúsculas), mantendo a ordem. */
    private List<String> removerRepetidos(List<String> bairros) {
        Map<String, String> unicos = new LinkedHashMap<>();

        for (String bairro : bairros) {
            String limpo = Textos.normalizarEspacos(bairro);
            unicos.putIfAbsent(limpo.toUpperCase(Locale.ROOT), limpo);
        }

        return new ArrayList<>(unicos.values());
    }
}
