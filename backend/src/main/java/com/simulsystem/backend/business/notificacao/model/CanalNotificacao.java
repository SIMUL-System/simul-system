package com.simulsystem.backend.business.notificacao.model;

/**
 * Canal por onde o lembrete é entregue. É gravado no histórico e também
 * escolhe a estratégia de envio (uma NotificacaoStrategy por canal).
 */
public enum CanalNotificacao {
    EMAIL,
    WEB_PUSH
}
