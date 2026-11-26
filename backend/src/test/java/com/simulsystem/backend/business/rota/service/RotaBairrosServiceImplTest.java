package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.cidade.CidadesDeTeste;
import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cidade.repository.CidadeRepository;
import com.simulsystem.backend.business.cidade.validation.CidadeValidation;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.dto.BairrosRotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.BairrosRotaResponseDTO;
import com.simulsystem.backend.business.rota.mapper.AreaAtendidaMapper;
import com.simulsystem.backend.business.rota.mapper.RotaMapper;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.business.rota.validation.AreaAtendidaValidation;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.core.exception.CidadeDivergenteException;
import com.simulsystem.backend.core.exception.RotaNaoEncontradaException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RotaBairrosServiceImplTest {

    private static final Cidade SENADOR_CANEDO = CidadesDeTeste.senadorCanedo();

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
    void deveCadastrarMoverEIgnorarBairrosDaCidadeDaRota() {
        Rota destino = rota(1L);
        Rota outra = rota(2L);

        AreaAtendida centro = area("Centro", destino);
        AreaAtendida vilaGalvao = area("Vila Galvão", outra);

        when(rotaValidation.buscarRotaExistente(1L)).thenReturn(destino);
        when(areaAtendidaRepository.findByCidade_IdAndBairroIgnoreCase(1L, "Centro"))
                .thenReturn(Optional.of(centro));
        when(areaAtendidaRepository.findByCidade_IdAndBairroIgnoreCase(1L, "vila galvão"))
                .thenReturn(Optional.of(vilaGalvao));
        when(areaAtendidaRepository.findByCidade_IdAndBairroIgnoreCase(1L, "Jardim Novo"))
                .thenReturn(Optional.empty());

        BairrosRotaRequestDTO pedido = new BairrosRotaRequestDTO(
                " Senador  Canedo ",
                List.of("Centro", "vila galvão", "  Jardim   Novo ", "jardim novo")
        );

        BairrosRotaResponseDTO resposta = rotaService.adicionarBairrosNaRota(1L, pedido);

        assertEquals(List.of("Jardim Novo"), resposta.cadastrados());
        assertEquals(List.of("Vila Galvão"), resposta.movidos());
        assertEquals(List.of("Centro"), resposta.jaEstavamNaRota());
        assertSame(destino, vilaGalvao.getRota());

        ArgumentCaptor<AreaAtendida> salvas = ArgumentCaptor.forClass(AreaAtendida.class);
        verify(areaAtendidaRepository, times(2)).save(salvas.capture());
        AreaAtendida nova = salvas.getAllValues().get(1);
        assertSame(SENADOR_CANEDO, nova.getCidade());
        assertEquals("Jardim Novo", nova.getBairro());
        assertSame(destino, nova.getRota());
    }

    @Test
    void deveAceitarPedidoSemCidadeUsandoACidadeDaRota() {
        Rota destino = rota(1L);

        when(rotaValidation.buscarRotaExistente(1L)).thenReturn(destino);
        when(areaAtendidaRepository.findByCidade_IdAndBairroIgnoreCase(1L, "Centro")).thenReturn(Optional.empty());

        BairrosRotaResponseDTO resposta =
                rotaService.adicionarBairrosNaRota(1L, new BairrosRotaRequestDTO(null, List.of("Centro")));

        assertEquals(List.of("Centro"), resposta.cadastrados());
    }

    @Test
    void naoDeveColocarBairroDeOutraCidadeNaRota() {
        when(rotaValidation.buscarRotaExistente(1L)).thenReturn(rota(1L));

        BairrosRotaRequestDTO pedido = new BairrosRotaRequestDTO("Goiânia", List.of("Setor Bueno"));

        assertThrows(CidadeDivergenteException.class, () -> rotaService.adicionarBairrosNaRota(1L, pedido));
        verify(areaAtendidaRepository, never()).findByCidade_IdAndBairroIgnoreCase(anyLong(), anyString());
        verify(areaAtendidaRepository, never()).save(any());
    }

    @Test
    void naoDeveAlterarNadaQuandoARotaNaoExiste() {
        when(rotaValidation.buscarRotaExistente(99L))
                .thenThrow(new RotaNaoEncontradaException("Rota não encontrada."));

        BairrosRotaRequestDTO pedido = new BairrosRotaRequestDTO("Senador Canedo", List.of("Centro"));

        assertThrows(RotaNaoEncontradaException.class, () -> rotaService.adicionarBairrosNaRota(99L, pedido));
        verify(areaAtendidaRepository, never()).save(any());
    }

    private Rota rota(Long id) {
        Rota rota = new Rota();
        rota.setId(id);
        rota.setCidade(SENADOR_CANEDO);
        return rota;
    }

    private AreaAtendida area(String bairro, Rota rota) {
        AreaAtendida area = new AreaAtendida();
        area.setCidade(SENADOR_CANEDO);
        area.setBairro(bairro);
        area.setRota(rota);
        return area;
    }
}
