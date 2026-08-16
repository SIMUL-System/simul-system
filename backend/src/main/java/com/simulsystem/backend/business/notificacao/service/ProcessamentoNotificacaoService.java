package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import java.time.LocalDateTime;

public interface ProcessamentoNotificacaoService {

    void processar(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    );
}