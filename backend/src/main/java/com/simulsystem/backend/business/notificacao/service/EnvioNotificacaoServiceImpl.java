package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.strategy.NotificacaoStrategy;

import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** Implementação de EnvioNotificacaoService baseada nas estratégias registradas. */
@Service
public class EnvioNotificacaoServiceImpl implements EnvioNotificacaoService {

    private final Map<CanalNotificacao, NotificacaoStrategy> estrategias = new EnumMap<>(CanalNotificacao.class);

    /** O Spring injeta todas as NotificacaoStrategy registradas como @Component. */
    public EnvioNotificacaoServiceImpl(List<NotificacaoStrategy> estrategiasDisponiveis) {
        for (NotificacaoStrategy estrategia : estrategiasDisponiveis) {
            estrategias.put(estrategia.getCanal(), estrategia);
        }
    }

    @Override
    public void enviar(CanalNotificacao canal, String destinatario, String assunto, String mensagem) {
        NotificacaoStrategy estrategia = estrategias.get(canal);

        if (estrategia == null) {
            throw new IllegalArgumentException("Não existe estratégia de notificação para o canal " + canal + ".");
        }

        estrategia.enviar(destinatario, assunto, mensagem);
    }
}
