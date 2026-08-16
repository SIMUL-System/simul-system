package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;

public interface EnvioNotificacaoService {

    void enviar(
            TipoNotificacao tipo,
            String destinatario,
            String assunto,
            String mensagem
    );
}