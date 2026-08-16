package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProcessamentoNotificacaoLoteServiceImpl
        implements ProcessamentoNotificacaoLoteService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ProcessamentoNotificacaoLoteServiceImpl.class
            );

    private final PreferenciaNotificacaoService preferenciaNotificacaoService;
    private final ProcessamentoNotificacaoService processamentoNotificacaoService;

    public ProcessamentoNotificacaoLoteServiceImpl(
            PreferenciaNotificacaoService preferenciaNotificacaoService,
            ProcessamentoNotificacaoService processamentoNotificacaoService
    ) {
        this.preferenciaNotificacaoService =
                preferenciaNotificacaoService;

        this.processamentoNotificacaoService =
                processamentoNotificacaoService;
    }

    @Override
    public void processar(LocalDateTime referencia) {
        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        List<PreferenciaNotificacao> preferencias =
                preferenciaNotificacaoService
                        .buscarElegiveisParaProcessamento();

        for (PreferenciaNotificacao preferencia : preferencias) {
            try {
                processamentoNotificacaoService.processar(
                        preferencia,
                        referencia
                );
            } catch (RuntimeException exception) {
                Long preferenciaId =
                        preferencia != null
                                ? preferencia.getId()
                                : null;

                LOGGER.error(
                        "Falha ao processar preferência de notificação id={}.",
                        preferenciaId,
                        exception
                );
            }
        }
    }
}