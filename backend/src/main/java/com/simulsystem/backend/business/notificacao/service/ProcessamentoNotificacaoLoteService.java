package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

/** Processa os lembretes do minuto para todas as preferências elegíveis. */
public interface ProcessamentoNotificacaoLoteService {

    /** Processa todas as preferências elegíveis para o minuto de referência. */
    void processar(LocalDateTime referencia);
}
