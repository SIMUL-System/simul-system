package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/** Controle do histórico: reserva, sucesso, falha com nova tentativa e cancelamento. */
public interface HistoricoNotificacaoService {

    /** Cria o registro PENDENTE; vazio se o lembrete já existir (evita envio duplicado). */
    Optional<HistoricoNotificacao> reservarEnvio(
            Usuario usuario,
            Rota rota,
            LocalDateTime dataHoraColeta,
            CanalNotificacao canal
    );

    /** Marca como ENVIADO. */
    void marcarComoEnviado(Long historicoId, LocalDateTime dataEnvio);

    /** Marca como FALHA e agenda nova tentativa enquanto houver tentativas. */
    void marcarComoFalha(Long historicoId, String mensagemErro, LocalDateTime referencia);

    /** Marca como CANCELADO (a configuração do usuário mudou). */
    void marcarComoCancelado(Long historicoId);

    /** Falhas prontas para nova tentativa. */
    List<HistoricoNotificacao> buscarFalhasElegiveisParaRetry(LocalDateTime referencia);
}
