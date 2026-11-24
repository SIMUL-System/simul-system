package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

/** Um ciclo do agendador: lembretes do minuto e depois os reenvios pendentes. */
public interface CicloNotificacaoService {

    /** Processa os lembretes do minuto e depois os reenvios. */
    void executar(LocalDateTime referencia);
}
