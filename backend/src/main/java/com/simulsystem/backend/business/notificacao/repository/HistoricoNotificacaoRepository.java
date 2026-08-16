package com.simulsystem.backend.business.notificacao.repository;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
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
}