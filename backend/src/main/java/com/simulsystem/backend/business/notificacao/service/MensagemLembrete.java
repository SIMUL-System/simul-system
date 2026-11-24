package com.simulsystem.backend.business.notificacao.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Texto do lembrete de coleta. Fica num só lugar para que o envio normal
 * e o reenvio (retry) mandem exatamente a mesma mensagem.
 */
@Component
public class MensagemLembrete {

    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    /** Assunto do e-mail e título da notificação do navegador. */
    public String assunto() {
        return "SIMUL - Lembrete de coleta seletiva";
    }

    /** Corpo do lembrete, com o nome do morador, a rota e a data/hora da coleta. */
    public String texto(String nomeUsuario, String nomeRota, LocalDateTime dataHoraColeta) {
        return "Olá, " + nomeUsuario + "! A coleta seletiva da rota " + nomeRota
                + " está prevista para " + dataHoraColeta.format(FORMATO) + ".";
    }
}
