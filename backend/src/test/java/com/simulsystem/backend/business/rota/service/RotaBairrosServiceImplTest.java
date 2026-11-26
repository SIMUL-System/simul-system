package com.simulsystem.backend.business.rota.service;

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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RotaBairrosServiceImplTest {

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
                areaAtendidaValidation
        );
    }

    @Test
    void deveCadastrarMoverEIgnorarBairrosConformeASituacao() {
        Rota destino = rota(1L);
        Rota outra = rota(2L);

        AreaAtendida centro = area("Centro", destino);
        AreaAtendida vilaGalvao = area("Vila Galvão", outra);

        when(rotaValidation.buscarRotaExistente(1L)).thenReturn(destino);
        when(areaAtendidaRepository.findByCidadeIgnoreCaseAndBairroIgnoreCase("Senador Canedo", "Centro"))
                .thenReturn(Optional.of(centro));
        when(areaAtendidaRepository.findByCidadeIgnoreCaseAndBairroIgnoreCase("Senador Canedo", "vila galvão"))
                .thenReturn(Optional.of(vilaGalvao));
        when(areaAtendidaRepository.findByCidadeIgnoreCaseAndBairroIgnoreCase("Senador Canedo", "Jardim Novo"))
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
        assertEquals("Senador Canedo", nova.getCidade());
        assertEquals("Jardim Novo", nova.getBairro());
        assertSame(destino, nova.getRota());
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
        return rota;
    }

    private AreaAtendida area(String bairro, Rota rota) {
        AreaAtendida area = new AreaAtendida();
        area.setCidade("Senador Canedo");
        area.setBairro(bairro);
        area.setRota(rota);
        return area;
    }
}
