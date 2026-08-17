package com.simulsystem.backend.business.rota.validation;

import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.core.exception.AreaAtendidaNaoEncontradaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AreaAtendidaValidationTest {

    @Mock
    private AreaAtendidaRepository areaAtendidaRepository;

    private AreaAtendidaValidation areaAtendidaValidation;

    @BeforeEach
    void setUp() {
        areaAtendidaValidation =
                new AreaAtendidaValidation(
                        areaAtendidaRepository
                );
    }

    @Test
    void deveRetornarAreaQuandoRotaEstiverAtiva() {
        String cidade = "Senador Canedo";
        String bairro = "Jardim Nova Goiânia";

        AreaAtendida areaAtendida =
                new AreaAtendida();

        when(
                areaAtendidaRepository
                        .findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(
                                cidade,
                                bairro
                        )
        ).thenReturn(
                Optional.of(areaAtendida)
        );

        AreaAtendida resultado =
                areaAtendidaValidation
                        .buscarAreaAtendidaComRotaAtiva(
                                cidade,
                                bairro
                        );

        assertSame(
                areaAtendida,
                resultado
        );

        verify(
                areaAtendidaRepository
        ).findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(
                cidade,
                bairro
        );
    }

    @Test
    void deveLancarExcecaoQuandoNaoExistirRotaAtivaParaArea() {
        String cidade = "Senador Canedo";
        String bairro = "Jardim Nova Goiânia";

        when(
                areaAtendidaRepository
                        .findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(
                                cidade,
                                bairro
                        )
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                AreaAtendidaNaoEncontradaException.class,
                () ->
                        areaAtendidaValidation
                                .buscarAreaAtendidaComRotaAtiva(
                                        cidade,
                                        bairro
                                )
        );

        verify(
                areaAtendidaRepository
        ).findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(
                cidade,
                bairro
        );
    }
}