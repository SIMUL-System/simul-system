package com.simulsystem.backend.business.notificacao.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CicloNotificacaoServiceImpl
        implements CicloNotificacaoService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    CicloNotificacaoServiceImpl.class
            );

    private final ProcessamentoNotificacaoLoteService
            processamentoNotificacaoLoteService;

    private final ProcessamentoRetryNotificacaoService
            processamentoRetryNotificacaoService;

    public CicloNotificacaoServiceImpl(
            ProcessamentoNotificacaoLoteService
                    processamentoNotificacaoLoteService,
            ProcessamentoRetryNotificacaoService
                    processamentoRetryNotificacaoService
    ) {
        this.processamentoNotificacaoLoteService =
                processamentoNotificacaoLoteService;

        this.processamentoRetryNotificacaoService =
                processamentoRetryNotificacaoService;
    }

    @Override
    public void executar(LocalDateTime referencia) {
        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        processarNotificacoesNormais(referencia);
        processarRetries(referencia);
    }

    private void processarNotificacoesNormais(
            LocalDateTime referencia
    ) {
        try {
            processamentoNotificacaoLoteService
                    .processar(referencia);

        } catch (RuntimeException exception) {
            LOGGER.error(
                    "Falha geral ao processar notificações normais.",
                    exception
            );
        }
    }

    private void processarRetries(
            LocalDateTime referencia
    ) {
        try {
            processamentoRetryNotificacaoService
                    .processar(referencia);

        } catch (RuntimeException exception) {
            LOGGER.error(
                    "Falha geral ao processar retries de notificações.",
                    exception
            );
        }
    }
}