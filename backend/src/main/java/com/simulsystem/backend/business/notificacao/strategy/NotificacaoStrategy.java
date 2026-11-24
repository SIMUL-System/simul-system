package com.simulsystem.backend.business.notificacao.strategy;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;

/**
 * Estratégia de envio de um canal de notificação.
 * Para criar um canal novo basta implementar esta interface como @Component:
 * o EnvioNotificacaoService a encontra sozinho.
 */
public interface NotificacaoStrategy {

    /** Canal atendido por esta estratégia. */
    CanalNotificacao getCanal();

    /**
     * Entrega a mensagem ao usuário identificado pelo e-mail.
     *
     * @throws RuntimeException quando a entrega falha (o chamador registra a falha e agenda nova tentativa)
     */
    void enviar(String destinatario, String assunto, String mensagem);
}
