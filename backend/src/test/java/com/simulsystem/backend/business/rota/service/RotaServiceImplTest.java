package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.cidade.CidadesDeTeste;
import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cidade.repository.CidadeRepository;
import com.simulsystem.backend.business.cidade.validation.CidadeValidation;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.mapper.AreaAtendidaMapper;
import com.simulsystem.backend.business.rota.mapper.RotaMapper;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.business.rota.validation.AreaAtendidaValidation;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.core.exception.CidadeDivergenteException;
import com.simulsystem.backend.core.exception.CidadeNaoEncontradaException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RotaServiceImplTest {

    @Mock
    private RotaRepository rotaRepository;

    @Mock
    private AreaAtendidaRepository areaAtendidaRepository;

    @Mock
    private CronogramaService cronogramaService;

    @Mock
    private RotaMapper rotaMapper;

    @Mock
    private AreaAtendidaMapper areaAtendidaMapper;

    @Mock
    private RotaValidation rotaValidation;

    @Mock
    private AreaAtendidaValidation areaAtendidaValidation;

    @Mock
    private CidadeRepository cidadeRepository;

    private RotaServiceImpl rotaService;

    @BeforeEach
    void setUp() {
        rotaService = new RotaServiceImpl(
                        rotaRepository,
                        areaAtendidaRepository,
                        cronogramaService,
                        rotaMapper,
                        areaAtendidaMapper,
                        rotaValidation,
                        areaAtendidaValidation,
                        new CidadeValidation(cidadeRepository)
                );
    }

    @Test
    void deveConsultarColetaUsandoCronogramaService() {
        String cidade = "Senador Canedo";
        String bairro = "Jardim Nova Goiânia";

        Long rotaId = 1L;

        AreaAtendida areaAtendida = new AreaAtendida();

        Rota rota = new Rota();

        rota.setId(rotaId);

        areaAtendida.setRota(rota);

        List<Cronograma> cronogramas = List.of(new Cronograma(), new Cronograma());

        ConsultaColetaResponseDTO responseDTO = org.mockito.Mockito.mock(ConsultaColetaResponseDTO.class);

        when(areaAtendidaValidation.buscarAreaAtendidaComRotaAtiva(cidade, bairro)).thenReturn(areaAtendida);

        when(cronogramaService.buscarAtivosPorRota(rotaId)).thenReturn(cronogramas);

        when(rotaMapper.toConsultaColetaResponseDTO(areaAtendida, cronogramas)).thenReturn(responseDTO);

        ConsultaColetaResponseDTO resultado = rotaService.consultarPorCidadeEBairro(cidade, bairro);

        assertSame(responseDTO, resultado);

        verify(areaAtendidaValidation).buscarAreaAtendidaComRotaAtiva(cidade, bairro);

        verify(cronogramaService).buscarAtivosPorRota(rotaId);

        verify(rotaMapper).toConsultaColetaResponseDTO(areaAtendida, cronogramas);
    }
    @Test
    void deveCriarRotaNaCidadeEscolhida() {
        Cidade goiania = CidadesDeTeste.goiania();
        RotaRequestDTO pedido = new RotaRequestDTO("Goiânia - Diurna (seg)", null, 2L, TipoColeta.SELETIVA);
        Rota rota = new Rota();

        when(cidadeRepository.findById(2L)).thenReturn(Optional.of(goiania));
        when(rotaMapper.toEntity(pedido, goiania)).thenReturn(rota);
        when(rotaRepository.save(rota)).thenReturn(rota);

        rotaService.cadastrarRota(pedido);

        verify(rotaMapper).toEntity(pedido, goiania);
        verify(rotaRepository).save(rota);
    }

    @Test
    void naoDeveCriarRotaEmCidadeInexistente() {
        when(cidadeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CidadeNaoEncontradaException.class,
                () -> rotaService.cadastrarRota(new RotaRequestDTO("Rota", null, 99L, null)));
        verify(rotaRepository, never()).save(any());
    }

    @Test
    void naoDeveTrocarACidadeDeUmaRota() {
        Rota rota = rotaDe(5L, CidadesDeTeste.senadorCanedo());

        when(rotaValidation.buscarRotaExistente(5L)).thenReturn(rota);

        assertThrows(CidadeDivergenteException.class,
                () -> rotaService.atualizarRota(5L, new RotaRequestDTO("Rota", null, 2L, null)));
        verify(rotaRepository, never()).save(any());
    }

    @Test
    void naoDeveMoverBairroParaRotaDeOutraCidade() {
        Rota rotaGoiania = rotaDe(8L, CidadesDeTeste.goiania());
        AreaAtendida bairroDeCanedo = new AreaAtendida();
        bairroDeCanedo.setId(3L);
        bairroDeCanedo.setBairro("Centro");
        bairroDeCanedo.setCidade(CidadesDeTeste.senadorCanedo());
        bairroDeCanedo.setRota(rotaDe(1L, CidadesDeTeste.senadorCanedo()));

        when(areaAtendidaValidation.buscarPorId(3L)).thenReturn(bairroDeCanedo);
        when(rotaValidation.buscarRotaExistente(8L)).thenReturn(rotaGoiania);

        assertThrows(CidadeDivergenteException.class,
                () -> rotaService.atualizarAreaAtendida(3L, new AreaAtendidaRequestDTO(null, "Centro", 8L)));
        verify(areaAtendidaRepository, never()).save(any());
    }

    @Test
    void naoDeveCadastrarBairroInformandoCidadeDiferenteDaRota() {
        when(rotaValidation.buscarRotaExistente(1L)).thenReturn(rotaDe(1L, CidadesDeTeste.senadorCanedo()));

        assertThrows(CidadeDivergenteException.class,
                () -> rotaService.cadastrarAreaAtendida(new AreaAtendidaRequestDTO("Goiânia", "Centro", 1L)));
        verify(areaAtendidaRepository, never()).save(any());
    }

    @Test
    void deveListarSoAsRotasDaCidade() {
        Cidade goiania = CidadesDeTeste.goiania();
        Rota rota = rotaDe(8L, goiania);

        when(cidadeRepository.findById(2L)).thenReturn(Optional.of(goiania));
        when(rotaRepository.findByCidade_Id(2L)).thenReturn(List.of(rota));

        assertEquals(1, rotaService.listarRotas(2L).size());
        verify(rotaRepository, never()).findAll();
    }

    private Rota rotaDe(Long id, Cidade cidade) {
        Rota rota = new Rota();
        rota.setId(id);
        rota.setCidade(cidade);
        return rota;
    }
}
