package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/** Implementação de ProcessamentoRetryNotificacaoService. */
@Service
public class ProcessamentoRetryNotificacaoServiceImpl implements ProcessamentoRetryNotificacaoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProcessamentoRetryNotificacaoServiceImpl.class);

    private final HistoricoNotificacaoService historicoNotificacaoService;
    private final EnvioNotificacaoService envioNotificacaoService;
    private final PreferenciaNotificacaoService preferenciaNotificacaoService;
    private final MensagemLembrete mensagemLembrete;

    public ProcessamentoRetryNotificacaoServiceImpl(
            HistoricoNotificacaoService historicoNotificacaoService,
            EnvioNotificacaoService envioNotificacaoService,
            PreferenciaNotificacaoService preferenciaNotificacaoService,
            MensagemLembrete mensagemLembrete) {
        this.historicoNotificacaoService = historicoNotificacaoService;
        this.envioNotificacaoService = envioNotificacaoService;
        this.preferenciaNotificacaoService = preferenciaNotificacaoService;
        this.mensagemLembrete = mensagemLembrete;
    }

    @Override
    public void processar(LocalDateTime referencia) {
        if (referencia == null) {
            throw new IllegalArgumentException("A data e hora de referência são obrigatórias.");
        }

        List<HistoricoNotificacao> historicos = historicoNotificacaoService.buscarFalhasElegiveisParaRetry(referencia);

        // Um registro com problema não pode impedir os demais de serem reenviados.
        for (HistoricoNotificacao historico : historicos) {
            try {
                processarHistorico(historico, referencia);
            } catch (RuntimeException exception) {
                LOGGER.error("Erro inesperado ao reenviar o histórico id={}.",
                        historico != null ? historico.getId() : null, exception);
            }
        }
    }

    /**
     * Reenvia pelo mesmo canal da falha original. Se o usuário desligou o canal,
     * trocou de rota ou a rota foi desativada, o reenvio é cancelado.
     */
    private void processarHistorico(HistoricoNotificacao historico, LocalDateTime referencia) {
        validarHistorico(historico);

        boolean podeReceber = preferenciaNotificacaoService.podeReceber(
                historico.getUsuario().getId(), historico.getRota().getId(), historico.getCanal());

        if (!podeReceber) {
            historicoNotificacaoService.marcarComoCancelado(historico.getId());
            LOGGER.info("Reenvio cancelado: a configuração atual não permite envio. historicoId={}",
                    historico.getId());
            return;
        }

        try {
            envioNotificacaoService.enviar(
                    historico.getCanal(),
                    historico.getUsuario().getEmail(),
                    mensagemLembrete.assunto(),
                    mensagemLembrete.texto(
                            historico.getUsuario().getNome(),
                            historico.getRota(),
                            historico.getDataHoraColeta()));
            historicoNotificacaoService.marcarComoEnviado(historico.getId(), referencia);
        } catch (RuntimeException exception) {
            historicoNotificacaoService.marcarComoFalha(historico.getId(), exception.getMessage(), referencia);
        }
    }

    private void validarHistorico(HistoricoNotificacao historico) {
        if (historico == null || historico.getId() == null) {
            throw new IllegalArgumentException("O histórico da notificação é obrigatório.");
        }

        if (historico.getUsuario() == null || historico.getUsuario().getId() == null) {
            throw new IllegalArgumentException("O usuário do histórico é obrigatório.");
        }

        if (historico.getRota() == null || historico.getRota().getId() == null) {
            throw new IllegalArgumentException("A rota do histórico é obrigatória.");
        }

        if (historico.getDataHoraColeta() == null) {
            throw new IllegalArgumentException("A data e hora da coleta são obrigatórias.");
        }

        if (historico.getCanal() == null) {
            throw new IllegalArgumentException("O canal do histórico é obrigatório.");
        }
    }
}
