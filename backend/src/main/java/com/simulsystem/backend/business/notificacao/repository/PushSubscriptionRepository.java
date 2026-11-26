package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.PushSubscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Acesso às inscrições de navegador. */
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    /** Navegadores inscritos do usuário. */
    List<PushSubscription> findByUsuarioId(Long usuarioId);

    /** Apaga as inscrições do usuário (exclusão da conta). */
    void deleteByUsuarioId(Long usuarioId);

    /** Inscrição pelo endpoint do navegador. */
    Optional<PushSubscription> findByEndpoint(String endpoint);
}
