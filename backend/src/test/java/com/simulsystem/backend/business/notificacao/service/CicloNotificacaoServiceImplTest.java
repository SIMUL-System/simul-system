package com.simulsystem.backend.business.notificacao.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CicloNotificacaoServiceImplTest {

    @Mock
    private ProcessamentoNotificacaoLoteService
            processamentoNotificacaoLoteService;

    @Mock
    private ProcessamentoRetryNotificacaoService
            processamentoRetryNotificacaoService;

    private CicloNotificacaoServiceImpl service;

    private LocalDateTime referencia;

    @BeforeEach
    void setUp() {
        service = new CicloNotificacaoServiceImpl(
                processamentoNotificacaoLoteService,
                processamentoRetryNotificacaoService
        );

        referencia =
                LocalDateTime.of(
                        2026,
                        8,
                        17,
                        16,
                        5
                );
    }

    @Test
    void deveExecutarProcessamentoNormalEDepoisRetries() {
        service.executar(referencia);

        InOrder ordem = inOrder(
                processamentoNotificacaoLoteService,
                processamentoRetryNotificacaoService
        );

        ordem.verify(
                processamentoNotificacaoLoteService
        ).processar(referencia);

        ordem.verify(
                processamentoRetryNotificacaoService
        ).processar(referencia);
    }

    @Test
    void deveExecutarRetriesMesmoQuandoProcessamentoNormalFalhar() {
        doThrow(
                new RuntimeException(
                        "Falha geral nas notificações normais"
                )
        ).when(processamentoNotificacaoLoteService)
                .processar(referencia);

        service.executar(referencia);

        verify(processamentoNotificacaoLoteService)
                .processar(referencia);

        verify(processamentoRetryNotificacaoService)
                .processar(referencia);
    }

    @Test
    void deveEncerrarCicloSemPropagarErroQuandoRetryFalhar() {
        doThrow(
                new RuntimeException(
                        "Falha geral nos retries"
                )
        ).when(processamentoRetryNotificacaoService)
                .processar(referencia);

        service.executar(referencia);

        verify(processamentoNotificacaoLoteService)
                .processar(referencia);

        verify(processamentoRetryNotificacaoService)
                .processar(referencia);
    }

    @Test
    void deveRejeitarReferenciaNula() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.executar(null)
        );

        verifyNoInteractions(
                processamentoNotificacaoLoteService,
                processamentoRetryNotificacaoService
        );
    }
}