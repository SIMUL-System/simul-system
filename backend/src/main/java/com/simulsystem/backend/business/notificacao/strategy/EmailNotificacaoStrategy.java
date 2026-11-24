package com.simulsystem.backend.business.notificacao.strategy;

import com.simulsystem.backend.business.notificacao.email.EmailGateway;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;

import org.springframework.stereotype.Component;

/**
 * Canal oficial de notificação. O transporte (SMTP ou API do Brevo)
 * fica no EmailGateway, escolhido por configuração.
 */
@Component
public class EmailNotificacaoStrategy implements NotificacaoStrategy {

    private final EmailGateway emailGateway;

    public EmailNotificacaoStrategy(EmailGateway emailGateway) {
        this.emailGateway = emailGateway;
    }

    @Override
    public CanalNotificacao getCanal() {
        return CanalNotificacao.EMAIL;
    }

    @Override
    public void enviar(String destinatario, String assunto, String mensagem) {
        emailGateway.enviar(destinatario, assunto, mensagem);
    }
}
