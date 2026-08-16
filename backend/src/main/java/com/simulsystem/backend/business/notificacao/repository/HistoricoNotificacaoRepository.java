package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.StatusNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HistoricoNotificacaoRepository
        extends JpaRepository<HistoricoNotificacao, Long> {

    boolean existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
            Long usuarioId,
            Long rotaId,
            LocalDateTime dataHoraColeta,
            CanalNotificacao canal
    );

    Optional<HistoricoNotificacao>
    findByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
            Long usuarioId,
            Long rotaId,
            LocalDateTime dataHoraColeta,
            CanalNotificacao canal
    );

    @Query("""
            SELECT h
            FROM HistoricoNotificacao h
            JOIN FETCH h.usuario u
            JOIN FETCH h.rota r
            WHERE h.status = :status
              AND h.proximaTentativa IS NOT NULL
              AND h.proximaTentativa <= :referencia
              AND h.numeroTentativas < :limiteTentativas
            ORDER BY h.proximaTentativa ASC, h.id ASC
            """)
    List<HistoricoNotificacao> buscarFalhasElegiveisParaRetry(
            @Param("status") StatusNotificacao status,
            @Param("referencia") LocalDateTime referencia,
            @Param("limiteTentativas") Integer limiteTentativas
    );
}