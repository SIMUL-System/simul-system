package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;

/** Ponto único de envio: escolhe a estratégia pelo canal. */
public interface EnvioNotificacaoService {

    /**
     * Envia a mensagem pelo canal informado.
     *
     * @throws IllegalArgumentException quando não existe estratégia para o canal
     */
    void enviar(CanalNotificacao canal, String destinatario, String assunto, String mensagem);
}
