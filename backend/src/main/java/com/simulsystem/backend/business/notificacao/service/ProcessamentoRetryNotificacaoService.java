package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

public interface ProcessamentoRetryNotificacaoService {

    void processar(LocalDateTime referencia);
}