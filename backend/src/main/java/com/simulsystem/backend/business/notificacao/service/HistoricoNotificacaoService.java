package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HistoricoNotificacaoService {

    Optional<HistoricoNotificacao> reservarEnvio(
            Usuario usuario,
            Rota rota,
            LocalDateTime dataHoraColeta,
            CanalNotificacao canal
    );

    void marcarComoEnviado(
            Long historicoId,
            LocalDateTime dataEnvio
    );

    void marcarComoFalha(
            Long historicoId,
            String mensagemErro,
            LocalDateTime referencia
    );

    List<HistoricoNotificacao> buscarFalhasElegiveisParaRetry(
            LocalDateTime referencia
    );
}