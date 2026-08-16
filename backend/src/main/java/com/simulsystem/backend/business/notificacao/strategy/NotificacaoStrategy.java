package com.simulsystem.backend.business.notificacao.strategy;

public interface NotificacaoStrategy {

    TipoNotificacao getTipo();

    void enviar(
            String destinatario,
            String assunto,
            String mensagem
    );
}