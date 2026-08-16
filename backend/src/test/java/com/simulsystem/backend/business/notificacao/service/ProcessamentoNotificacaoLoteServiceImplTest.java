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
        service = new ProcessamentoNotificacaoLoteServiceImpl(
                preferenciaNotificacaoService,
                processamentoNotificacaoService
        );

        referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        16,
                        0
                );
    }

    @Test
    void deveProcessarTodasAsPreferenciasElegiveis() {
        PreferenciaNotificacao preferencia1 =
                criarPreferencia(1L);

        PreferenciaNotificacao preferencia2 =
                criarPreferencia(2L);

        when(preferenciaNotificacaoService
                .buscarElegiveisParaProcessamento())
                .thenReturn(
                        List.of(
                                preferencia1,
                                preferencia2
                        )
                );

        service.processar(referencia);

        InOrder ordem =
                inOrder(processamentoNotificacaoService);

        ordem.verify(processamentoNotificacaoService)
                .processar(
                        preferencia1,
                        referencia
                );

        ordem.verify(processamentoNotificacaoService)
                .processar(
                        preferencia2,
                        referencia
                );
    }

    @Test
    void naoDeveProcessarQuandoNaoExistiremPreferenciasElegiveis() {
        when(preferenciaNotificacaoService
                .buscarElegiveisParaProcessamento())
                .thenReturn(List.of());

        service.processar(referencia);

        verifyNoInteractions(
                processamentoNotificacaoService
        );
    }

    @Test
    void deveContinuarProcessandoQuandoUmaPreferenciaGerarErro() {
        PreferenciaNotificacao preferencia1 =
                criarPreferencia(1L);

        PreferenciaNotificacao preferencia2 =
                criarPreferencia(2L);

        when(preferenciaNotificacaoService
                .buscarElegiveisParaProcessamento())
                .thenReturn(
                        List.of(
                                preferencia1,
                                preferencia2
                        )
                );

        doThrow(
                new RuntimeException(
                        "Erro inesperado"
                )
        ).when(processamentoNotificacaoService)
                .processar(
                        preferencia1,
                        referencia
                );

        service.processar(referencia);

        verify(processamentoNotificacaoService)
                .processar(
                        preferencia1,
                        referencia
                );

        verify(processamentoNotificacaoService)
                .processar(
                        preferencia2,
                        referencia
                );
    }

    @Test
    void deveRejeitarReferenciaNula() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.processar(null)
        );

        verifyNoInteractions(
                preferenciaNotificacaoService,
                processamentoNotificacaoService
        );
    }

    private PreferenciaNotificacao criarPreferencia(Long id) {
        PreferenciaNotificacao preferencia =
                new PreferenciaNotificacao();

        preferencia.setId(id);

        return preferencia;
    }
}