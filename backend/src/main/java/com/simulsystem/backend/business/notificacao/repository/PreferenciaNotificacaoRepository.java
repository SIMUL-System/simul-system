package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreferenciaNotificacaoRepository
        extends JpaRepository<PreferenciaNotificacao, Long> {

    Optional<PreferenciaNotificacao> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);
}