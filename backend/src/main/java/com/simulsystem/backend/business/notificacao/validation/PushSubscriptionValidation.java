package com.simulsystem.backend.business.notificacao.validation;

import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.core.exception.PushSubscriptionEmUsoException;
import com.simulsystem.backend.core.exception.PushSubscriptionNaoEncontradaException;

import org.springframework.stereotype.Component;

import java.util.Optional;

/** Regras da inscrição de navegador para Web Push. */
@Component
public class PushSubscriptionValidation {

    private final PushSubscriptionRepository pushSubscriptionRepository;

    public PushSubscriptionValidation(PushSubscriptionRepository pushSubscriptionRepository) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
    }

    /**
     * Inscrição já existente para o endpoint, se houver.
     * Um navegador só pode estar ligado a uma conta: se for de outra, gera 409.
     */
    public Optional<PushSubscription> buscarInscricaoDoUsuario(String endpoint, Long usuarioId) {
        Optional<PushSubscription> existente = pushSubscriptionRepository.findByEndpoint(endpoint);

        existente.ifPresent(inscricao -> {
            if (!inscricao.getUsuario().getId().equals(usuarioId)) {
                throw new PushSubscriptionEmUsoException("Este navegador já está associado a outra conta.");
            }
        });

        return existente;
    }

    /** Inscrição do usuário para remoção; 404 se não existir ou não for dele. */
    public PushSubscription buscarParaRemocao(String endpoint, Long usuarioId) {
        return pushSubscriptionRepository.findByEndpoint(endpoint)
                .filter(inscricao -> inscricao.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new PushSubscriptionNaoEncontradaException(
                        "Este navegador não está inscrito nesta conta."));
    }
}
