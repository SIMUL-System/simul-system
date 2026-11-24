package com.simulsystem.backend.business.notificacao.email;

import com.simulsystem.backend.core.exception.EnvioEmailException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Envio por SMTP (Gmail, Mailtrap etc.). Continua sendo o padrão para
 * rodar localmente. Na Render gratuita as portas SMTP são bloqueadas:
 * lá use SIMUL_MAIL_PROVEDOR=brevo.
 */
@Component
@ConditionalOnProperty(
        name = "simul.mail.provedor",
        havingValue = "smtp",
        matchIfMissing = true
)
public class SmtpEmailGateway implements EmailGateway {

    private final JavaMailSender mailSender;
    private final String remetente;

    public SmtpEmailGateway(
            JavaMailSender mailSender,
            @Value("${simul.mail.remetente}") String remetente
    ) {
        this.mailSender = mailSender;
        this.remetente = remetente;
    }

    @Override
    public void enviar(
            String destinatario,
            String assunto,
            String texto
    ) {
        SimpleMailMessage email = new SimpleMailMessage();

        email.setFrom(remetente);
        email.setTo(destinatario);
        email.setSubject(assunto);
        email.setText(texto);

        try {
            mailSender.send(email);
        } catch (MailException exception) {
            throw new EnvioEmailException(
                    "Não foi possível enviar o e-mail por SMTP.",
                    exception
            );
        }
    }
}
