package com.simulsystem.backend.business.notificacao.strategy;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailNotificacaoStrategy
        implements NotificacaoStrategy {

    private final JavaMailSender mailSender;
    private final String remetente;

    public EmailNotificacaoStrategy(
            JavaMailSender mailSender,
            @Value("${simul.mail.remetente}") String remetente
    ) {
        this.mailSender = mailSender;
        this.remetente = remetente;
    }

    @Override
    public TipoNotificacao getTipo() {
        return TipoNotificacao.EMAIL;
    }

    @Override
    public void enviar(
            String destinatario,
            String assunto,
            String mensagem
    ) {
        SimpleMailMessage email =
                new SimpleMailMessage();

        email.setFrom(remetente);
        email.setTo(destinatario);
        email.setSubject(assunto);
        email.setText(mensagem);

        mailSender.send(email);
    }
}