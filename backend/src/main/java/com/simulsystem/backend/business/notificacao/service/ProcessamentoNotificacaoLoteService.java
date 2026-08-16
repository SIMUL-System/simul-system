package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

public interface ProcessamentoNotificacaoLoteService {

    void processar(LocalDateTime referencia);
}