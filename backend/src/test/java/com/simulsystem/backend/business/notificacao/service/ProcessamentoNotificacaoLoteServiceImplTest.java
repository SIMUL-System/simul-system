package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessamentoNotificacaoLoteServiceImplTest {

    @Mock
    private PreferenciaNotificacaoService preferenciaNotificacaoService;

    @Mock
    private ProcessamentoNotificacaoService processamentoNotificacaoService;

    private ProcessamentoNotificacaoLoteServiceImpl service;

    private LocalDateTime referencia;

    @BeforeEach
    void setUp() {
        service =
                new ProcessamentoNotificacaoLoteServiceImpl(
                        preferenciaNotificacaoService,
                        processamentoNotificacaoService
                );

        referencia =
                LocalDateTime.of(
                        2026,
                        9,
                        7,
                        19,
                        30
                );
    }

    @Test
    void deveProcessarTodasAsPreferenciasElegiveis() {
        PreferenciaNotificacao preferencia1 =
                new PreferenciaNotificacao();

        preferencia1.setId(1L);

        PreferenciaNotificacao preferencia2 =
                new PreferenciaNotificacao();

        preferencia2.setId(2L);

        when(
                preferenciaNotificacaoService
                        .buscarElegiveisParaProcessamento()
        )
                .thenReturn(
                        List.of(
                                preferencia1,
                                preferencia2
                        )
                );

        service.processar(
                referencia
        );

        verify(
                processamentoNotificacaoService
        )
                .processar(
                        preferencia1,
                        referencia
                );

        verify(
                processamentoNotificacaoService
        )
                .processar(
                        preferencia2,
                        referencia
                );
    }

    @Test
    void deveManterOrdemDasPreferenciasDoLote() {
        PreferenciaNotificacao preferencia1 =
                new PreferenciaNotificacao();

        preferencia1.setId(1L);

        PreferenciaNotificacao preferencia2 =
                new PreferenciaNotificacao();

        preferencia2.setId(2L);

        when(
                preferenciaNotificacaoService
                        .buscarElegiveisParaProcessamento()
        )
                .thenReturn(
                        List.of(
                                preferencia1,
                                preferencia2
                        )
                );

        service.processar(
                referencia
        );

        InOrder inOrder =
                inOrder(
                        processamentoNotificacaoService
                );

        inOrder.verify(
                processamentoNotificacaoService
        )
                .processar(
                        preferencia1,
                        referencia
                );

        inOrder.verify(
                processamentoNotificacaoService
        )
                .processar(
                        preferencia2,
                        referencia
                );
    }

    @Test
    void naoDeveFalharLoteQuandoUmaPreferenciaGerarErro() {
        PreferenciaNotificacao preferencia1 =
                new PreferenciaNotificacao();

        preferencia1.setId(1L);

        PreferenciaNotificacao preferencia2 =
                new PreferenciaNotificacao();

        preferencia2.setId(2L);

        when(
                preferenciaNotificacaoService
                        .buscarElegiveisParaProcessamento()
        )
                .thenReturn(
                        List.of(
                                preferencia1,
                                preferencia2
                        )
                );

        doThrow(
                new RuntimeException(
                        "Falha de teste"
                )
        )
                .when(
                        processamentoNotificacaoService
                )
                .processar(
                        preferencia1,
                        referencia
                );

        service.processar(
                referencia
        );

        verify(
                processamentoNotificacaoService
        )
                .processar(
                        preferencia1,
                        referencia
                );

        verify(
                processamentoNotificacaoService
        )
                .processar(
                        preferencia2,
                        referencia
                );
    }

    @Test
    void naoDeveProcessarQuandoNaoExistiremPreferenciasElegiveis() {
        when(
                preferenciaNotificacaoService
                        .buscarElegiveisParaProcessamento()
        )
                .thenReturn(
                        List.of()
                );

        service.processar(
                referencia
        );

        verifyNoInteractions(
                processamentoNotificacaoService
        );
    }

    @Test
    void deveBuscarPreferenciasElegiveisUmaUnicaVez() {
        when(
                preferenciaNotificacaoService
                        .buscarElegiveisParaProcessamento()
        )
                .thenReturn(
                        List.of()
                );

        service.processar(
                referencia
        );

        verify(
                preferenciaNotificacaoService,
                times(1)
        )
                .buscarElegiveisParaProcessamento();
    }

    @Test
    void deveLancarErroQuandoReferenciaForNula() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.processar(
                                null
                        )
        );

        verifyNoInteractions(
                preferenciaNotificacaoService,
                processamentoNotificacaoService
        );
    }
}