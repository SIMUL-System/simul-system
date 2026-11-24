package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

/** Reenvia os lembretes que falharam e ainda têm tentativas. */
public interface ProcessamentoRetryNotificacaoService {

    /** Reenvia as falhas elegíveis no minuto de referência. */
    void processar(LocalDateTime referencia);
}
