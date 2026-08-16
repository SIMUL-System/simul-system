package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.strategy.NotificacaoStrategy;
import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class EnvioNotificacaoServiceImpl
        implements EnvioNotificacaoService {

    private final Map<TipoNotificacao, NotificacaoStrategy> strategies;

    public EnvioNotificacaoServiceImpl(
            List<NotificacaoStrategy> strategiesDisponiveis
    ) {
        this.strategies =
                new EnumMap<>(TipoNotificacao.class);

        for (NotificacaoStrategy strategy
                : strategiesDisponiveis) {

            this.strategies.put(
                    strategy.getTipo(),
                    strategy
            );
        }
    }

    @Override
    public void enviar(
            TipoNotificacao tipo,
            String destinatario,
            String assunto,
            String mensagem
    ) {
        NotificacaoStrategy strategy =
                strategies.get(tipo);

        if (strategy == null) {
            throw new IllegalArgumentException(
                    "Não existe estratégia de notificação para o tipo informado."
            );
        }

        strategy.enviar(
                destinatario,
                assunto,
                mensagem
        );
    }
}