package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import java.time.LocalDateTime;

/** Processa o lembrete de uma preferência em cada canal ligado. */
public interface ProcessamentoNotificacaoService {

    /** Envia o lembrete da preferência se ele vencer no minuto de referência. */
    void processar(PreferenciaNotificacao preferencia, LocalDateTime referencia);
}
