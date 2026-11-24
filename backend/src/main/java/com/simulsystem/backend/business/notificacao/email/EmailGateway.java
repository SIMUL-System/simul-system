package com.simulsystem.backend.business.notificacao.email;

/**
 * Transporte do e-mail. Quem envia (lembrete, verificação, recuperação
 * de senha) não sabe se a mensagem sai por SMTP ou por API HTTPS:
 * a escolha é feita pela variável SIMUL_MAIL_PROVEDOR.
 */
public interface EmailGateway {

    /**
     * @throws com.simulsystem.backend.core.exception.EnvioEmailException
     *         quando o provedor recusa ou não responde.
     */
    void enviar(
            String destinatario,
            String assunto,
            String texto
    );
}
