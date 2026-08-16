package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

public interface CicloNotificacaoService {

    void executar(LocalDateTime referencia);
}