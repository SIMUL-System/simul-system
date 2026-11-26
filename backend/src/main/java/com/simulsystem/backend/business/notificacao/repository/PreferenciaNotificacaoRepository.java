package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/** Acesso às preferências de lembrete. */
public interface PreferenciaNotificacaoRepository
        extends JpaRepository<PreferenciaNotificacao, Long> {
    /** Preferência do usuário, já com bairro e rota carregados. */
    @EntityGraph(attributePaths = {"usuario", "areaAtendida", "areaAtendida.rota"})
    Optional<PreferenciaNotificacao> findByUsuarioId(Long usuarioId);

    /** O usuário já tem preferência? */
    boolean existsByUsuarioId(Long usuarioId);

    /** Preferências de usuários ativos, cujo bairro está numa rota ativa, com algum canal ligado. */
    @Query("""
            SELECT p
            FROM PreferenciaNotificacao p
            JOIN FETCH p.usuario u
            JOIN FETCH p.areaAtendida a
            JOIN FETCH a.rota r
            WHERE u.ativo = true
              AND r.ativo = true
              AND (
                    p.emailAtivo = true
                    OR p.webPushAtivo = true
                  )
            """)
    List<PreferenciaNotificacao> buscarElegiveisParaProcessamento();
}
