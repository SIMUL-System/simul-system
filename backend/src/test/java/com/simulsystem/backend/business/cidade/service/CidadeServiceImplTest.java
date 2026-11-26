package com.simulsystem.backend.business.cidade.service;

import com.simulsystem.backend.business.cidade.CidadesDeTeste;
import com.simulsystem.backend.business.cidade.dto.CidadeResponseDTO;
import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cidade.repository.CidadeRepository;
import com.simulsystem.backend.business.cidade.validation.CidadeValidation;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.repository.CronogramaRepository;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.core.exception.CidadeNaoEncontradaException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CidadeServiceImplTest {

    @Mock
    private CidadeRepository cidadeRepository;

    @Mock
    private RotaRepository rotaRepository;

    @Mock
    private AreaAtendidaRepository areaAtendidaRepository;

    @Mock
    private CronogramaRepository cronogramaRepository;

    private CidadeServiceImpl cidadeService;

    @BeforeEach
    void setUp() {
        cidadeService = new CidadeServiceImpl(
                cidadeRepository, rotaRepository, areaAtendidaRepository, cronogramaRepository,
                new CidadeValidation(cidadeRepository));
    }

    @Test
    void deveContarRotasBairrosColetasEPendenciasDaCidade() {
        Cidade goiania = CidadesDeTeste.goiania();

        Rota comTudo = rota(1L, goiania, true, TipoColeta.SELETIVA);
        Rota semColeta = rota(2L, goiania, true, TipoColeta.NAO_INFORMADO);
        Rota semBairro = rota(3L, goiania, true, TipoColeta.SELETIVA);
        Rota inativa = rota(4L, goiania, false, TipoColeta.SELETIVA);

        AreaAtendida comContorno = area(comTudo, "{\"type\":\"Polygon\"}");
        AreaAtendida semContorno = area(comTudo, null);
        AreaAtendida daRotaSemColeta = area(semColeta, " ");

        Cronograma soTurno = coleta(comTudo, null);
        Cronograma comHorario = coleta(comTudo, LocalTime.of(7, 0));
        Cronograma daRotaSemBairro = coleta(semBairro, null);

        when(cidadeRepository.findById(2L)).thenReturn(Optional.of(goiania));
        when(rotaRepository.findByCidade_Id(2L)).thenReturn(List.of(comTudo, semColeta, semBairro, inativa));
        when(areaAtendidaRepository.findByCidade_Id(2L)).thenReturn(List.of(comContorno, semContorno, daRotaSemColeta));
        when(cronogramaRepository.findByRota_Cidade_IdAndAtivoTrue(2L))
                .thenReturn(List.of(soTurno, comHorario, daRotaSemBairro));

        CidadeResponseDTO cidade = cidadeService.buscarComIndicadores(2L);

        assertEquals("Goiânia", cidade.nome());
        assertEquals(4, cidade.rotas());
        assertEquals(3, cidade.rotasAtivas());
        assertEquals(3, cidade.bairros());
        assertEquals(2, cidade.bairrosSemContorno());
        assertEquals(3, cidade.coletasAtivas());
        assertEquals(2, cidade.coletasSemHorario());
        assertEquals(1, cidade.rotasSemColeta());
        assertEquals(1, cidade.rotasSemBairro());
        assertEquals(1, cidade.rotasTipoNaoInformado());
    }

    @Test
    void deveRecusarCidadeInexistente() {
        when(cidadeRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(CidadeNaoEncontradaException.class, () -> cidadeService.buscarComIndicadores(9L));
    }

    private Rota rota(Long id, Cidade cidade, boolean ativa, TipoColeta tipo) {
        Rota rota = new Rota();
        rota.setId(id);
        rota.setCidade(cidade);
        rota.setAtivo(ativa);
        rota.setTipoColeta(tipo);
        return rota;
    }

    private AreaAtendida area(Rota rota, String geometria) {
        AreaAtendida area = new AreaAtendida();
        area.setRota(rota);
        area.setCidade(rota.getCidade());
        area.setGeometriaGeoJson(geometria);
        return area;
    }

    private Cronograma coleta(Rota rota, LocalTime inicio) {
        Cronograma cronograma = new Cronograma();
        cronograma.setRota(rota);
        cronograma.setDiaSemana(DiaSemana.SEGUNDA);
        cronograma.setTurno(Turno.DIURNO);
        cronograma.setHorarioInicio(inicio);
        cronograma.setHorarioFim(inicio == null ? null : inicio.plusHours(4));
        cronograma.setAtivo(true);
        return cronograma;
    }
}
