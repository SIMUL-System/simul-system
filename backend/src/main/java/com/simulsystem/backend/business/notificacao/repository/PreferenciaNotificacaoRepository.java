package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/** Acesso às preferências de lembrete. */
public interface PreferenciaNotificacaoRepository
        extends JpaRepository<PreferenciaNotificacao, Long> {
    /** Preferência do usuário. */
    Optional<PreferenciaNotificacao> findByUsuarioId(Long usuarioId);

    /** O usuário já tem preferência? */
    boolean existsByUsuarioId(Long usuarioId);

    @Query("""
            SELECT p
            FROM PreferenciaNotificacao p
            JOIN FETCH p.usuario u
            JOIN FETCH p.rota r
            WHERE u.ativo = true
              AND r.ativo = true
              AND (
                    p.emailAtivo = true
                    OR p.webPushAtivo = true
                  )
            """)
    /** Preferências de usuários e rotas ativos com algum canal ligado. */
    List<PreferenciaNotificacao> buscarElegiveisParaProcessamento();
}
