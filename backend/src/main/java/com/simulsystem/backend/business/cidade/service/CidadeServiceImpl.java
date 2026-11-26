package com.simulsystem.backend.business.cidade.service;

import com.simulsystem.backend.business.cidade.dto.CidadeResponseDTO;
import com.simulsystem.backend.business.cidade.dto.FaixaTurnosDTO;
import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cidade.repository.CidadeRepository;
import com.simulsystem.backend.business.cidade.validation.CidadeValidation;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.business.rota.repository.RotaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** Implementação de CidadeService. */
@Service
public class CidadeServiceImpl implements CidadeService {

    private final CidadeRepository cidadeRepository;
    private final RotaRepository rotaRepository;
    private final AreaAtendidaRepository areaAtendidaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final CidadeValidation cidadeValidation;

    public CidadeServiceImpl(
            CidadeRepository cidadeRepository,
            RotaRepository rotaRepository,
            AreaAtendidaRepository areaAtendidaRepository,
            CronogramaRepository cronogramaRepository,
            CidadeValidation cidadeValidation
    ) {
        this.cidadeRepository = cidadeRepository;
        this.rotaRepository = rotaRepository;
        this.areaAtendidaRepository = areaAtendidaRepository;
        this.cronogramaRepository = cronogramaRepository;
        this.cidadeValidation = cidadeValidation;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CidadeResponseDTO> listarComIndicadores() {
        return cidadeRepository.findAllByOrderByNomeAsc()
                .stream()
                .map(this::indicadores)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CidadeResponseDTO buscarComIndicadores(Long id) {
        return indicadores(cidadeValidation.buscarCidadeExistente(id));
    }

    private CidadeResponseDTO indicadores(Cidade cidade) {
        List<Rota> rotas = rotaRepository.findByCidade_Id(cidade.getId());
        List<AreaAtendida> bairros = areaAtendidaRepository.findByCidade_Id(cidade.getId());
        List<Cronograma> coletas = cronogramaRepository.findByRota_Cidade_IdAndAtivoTrue(cidade.getId());

        List<Rota> ativas = rotas.stream().filter(rota -> Boolean.TRUE.equals(rota.getAtivo())).toList();

        Set<Long> rotasComColeta = coletas.stream()
                .map(coleta -> coleta.getRota().getId())
                .collect(Collectors.toSet());

        Set<Long> rotasComBairro = bairros.stream()
                .map(area -> area.getRota().getId())
                .collect(Collectors.toSet());

        return new CidadeResponseDTO(
                cidade.getId(),
                cidade.getNome(),
                cidade.getUf(),
                cidade.getFonte(),
                rotas.size(),
                ativas.size(),
                bairros.size(),
                bairros.stream().filter(area -> semTexto(area.getGeometriaGeoJson())).count(),
                coletas.size(),
                coletas.stream().filter(coleta -> !coleta.possuiHorario()).count(),
                ativas.stream().filter(rota -> !rotasComColeta.contains(rota.getId())).count(),
                ativas.stream().filter(rota -> !rotasComBairro.contains(rota.getId())).count(),
                ativas.stream().filter(rota -> rota.getTipoColeta() == TipoColeta.NAO_INFORMADO).count(),
                ativas.stream().filter(rota -> rota.getTipoColeta() == TipoColeta.CONVENCIONAL).count(),
                FaixaTurnosDTO.de(cidade)
        );
    }

    @Override
    @Transactional
    public CidadeResponseDTO atualizarTurnos(Long id, FaixaTurnosDTO faixa) {
        Cidade cidade = cidadeValidation.buscarCidadeExistente(id);

        cidadeValidation.validarFaixaTurnos(faixa);

        cidade.setDiurnoInicio(porMinuto(faixa.diurnoInicio()));
        cidade.setDiurnoFim(porMinuto(faixa.diurnoFim()));
        cidade.setNoturnoInicio(porMinuto(faixa.noturnoInicio()));
        cidade.setNoturnoFim(porMinuto(faixa.noturnoFim()));
        cidade.setFonteTurnos(faixa.fonte() == null || faixa.fonte().isBlank() ? null : faixa.fonte().trim());

        return indicadores(cidadeRepository.save(cidade));
    }

    private static LocalTime porMinuto(LocalTime horario) {
        return horario == null ? null : horario.truncatedTo(ChronoUnit.MINUTES);
    }

    private static boolean semTexto(String texto) {
        return texto == null || texto.isBlank();
    }
}
