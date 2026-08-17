package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.mapper.AreaAtendidaMapper;
import com.simulsystem.backend.business.rota.mapper.RotaMapper;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.business.rota.repository.RotaRepository;
import com.simulsystem.backend.business.rota.validation.AreaAtendidaValidation;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
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

    private RotaServiceImpl rotaService;

    @BeforeEach
    void setUp() {
        rotaService =
                new RotaServiceImpl(
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
    void deveConsultarColetaUsandoCronogramaService() {
        String cidade = "Senador Canedo";
        String bairro = "Jardim Nova Goiânia";

        Long rotaId = 1L;

        AreaAtendida areaAtendida =
                new AreaAtendida();

        Rota rota =
                new Rota();

        rota.setId(rotaId);

        areaAtendida.setRota(rota);

        List<Cronograma> cronogramas =
                List.of(
                        new Cronograma(),
                        new Cronograma()
                );

        ConsultaColetaResponseDTO responseDTO =
                org.mockito.Mockito.mock(
                        ConsultaColetaResponseDTO.class
                );

        when(
                areaAtendidaValidation
                        .buscarAreaAtendidaComRotaAtiva(
                                cidade,
                                bairro
                        )
        ).thenReturn(areaAtendida);

        when(
                cronogramaService.buscarAtivosPorRota(
                        rotaId
                )
        ).thenReturn(cronogramas);

        when(
                rotaMapper.toConsultaColetaResponseDTO(
                        areaAtendida,
                        cronogramas
                )
        ).thenReturn(responseDTO);

        ConsultaColetaResponseDTO resultado =
                rotaService.consultarPorCidadeEBairro(
                        cidade,
                        bairro
                );

        assertSame(
                responseDTO,
                resultado
        );

        verify(
                areaAtendidaValidation
        ).buscarAreaAtendidaComRotaAtiva(
                cidade,
                bairro
        );

        verify(
                cronogramaService
        ).buscarAtivosPorRota(
                rotaId
        );

        verify(
                rotaMapper
        ).toConsultaColetaResponseDTO(
                areaAtendida,
                cronogramas
        );
    }
}