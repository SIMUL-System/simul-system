package com.simulsystem.backend.business.notificacao.validation;

import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import org.springframework.stereotype.Component;

@Component
public class PushSubscriptionValidation {

    private final PushSubscriptionRepository pushSubscriptionRepository;

    public PushSubscriptionValidation(
            PushSubscriptionRepository pushSubscriptionRepository
    ) {
        this.pushSubscriptionRepository =
                pushSubscriptionRepository;
    }

    public PushSubscription buscarPorEndpoint(
            String endpoint
    ) {
        return pushSubscriptionRepository
                .findByEndpoint(endpoint)
                .orElse(null);
    }

    public PushSubscription buscarPorEndpointDoUsuario(
            String endpoint,
            Long usuarioId
    ) {
        PushSubscription subscription =
                pushSubscriptionRepository
                        .findByEndpoint(endpoint)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Subscription não encontrada."
                                )
                        );

        if (
                subscription.getUsuario() == null ||
                !subscription
                        .getUsuario()
                        .getId()
                        .equals(usuarioId)
        ) {
            throw new IllegalArgumentException(
                    "A subscription informada não pertence ao usuário autenticado."
            );
        }

        return subscription;
    }

    public boolean endpointJaExiste(
            String endpoint
    ) {
        return pushSubscriptionRepository
                .existsByEndpoint(endpoint);
    }
}