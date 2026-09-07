package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository
        extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByUsuarioId(Long usuarioId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    boolean existsByEndpoint(String endpoint);

    void deleteByEndpoint(String endpoint);
}