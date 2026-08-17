package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ProcessamentoRetryNotificacaoServiceImpl
        implements ProcessamentoRetryNotificacaoService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ProcessamentoRetryNotificacaoServiceImpl.class
            );

    private static final DateTimeFormatter FORMATADOR =
            DateTimeFormatter.ofPattern(
                    "dd/MM/yyyy 'às' HH:mm"
            );

    private final HistoricoNotificacaoService historicoNotificacaoService;
    private final EnvioNotificacaoService envioNotificacaoService;
    private final PreferenciaNotificacaoService preferenciaNotificacaoService;

    public ProcessamentoRetryNotificacaoServiceImpl(
            HistoricoNotificacaoService historicoNotificacaoService,
            EnvioNotificacaoService envioNotificacaoService,
            PreferenciaNotificacaoService preferenciaNotificacaoService
    ) {
        this.historicoNotificacaoService =
                historicoNotificacaoService;

        this.envioNotificacaoService =
                envioNotificacaoService;

        this.preferenciaNotificacaoService =
                preferenciaNotificacaoService;
    }

    @Override
    public void processar(LocalDateTime referencia) {
        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        List<HistoricoNotificacao> historicos =
                historicoNotificacaoService
                        .buscarFalhasElegiveisParaRetry(
                                referencia
                        );

        for (HistoricoNotificacao historico : historicos) {
            try {
                processarHistorico(
                        historico,
                        referencia
                );
            } catch (RuntimeException exception) {
                LOGGER.error(
                        "Erro inesperado ao processar retry do histórico id={}.",
                        historico != null
                                ? historico.getId()
                                : null,
                        exception
                );
            }
        }
    }

    private void processarHistorico(
            HistoricoNotificacao historico,
            LocalDateTime referencia
    ) {
        validarHistorico(historico);

        if (historico.getCanal() != CanalNotificacao.EMAIL) {
            LOGGER.warn(
                    "Retry ignorado para canal ainda não suportado. "
                            + "historicoId={}, canal={}",
                    historico.getId(),
                    historico.getCanal()
            );

            return;
        }

        boolean podeReceberEmail =
                preferenciaNotificacaoService
                        .podeReceberEmail(
                                historico.getUsuario().getId(),
                                historico.getRota().getId()
                        );

        if (!podeReceberEmail) {
            historicoNotificacaoService
                    .marcarComoCancelado(
                            historico.getId()
                    );

            LOGGER.info(
                    "Retry cancelado porque a configuração atual "
                            + "não permite envio. historicoId={}",
                    historico.getId()
            );

            return;
        }

        try {
            envioNotificacaoService.enviar(
                    TipoNotificacao.EMAIL,
                    historico.getUsuario().getEmail(),
                    criarAssunto(),
                    criarMensagem(historico)
            );

            historicoNotificacaoService.marcarComoEnviado(
                    historico.getId(),
                    referencia
            );

        } catch (RuntimeException exception) {
            historicoNotificacaoService.marcarComoFalha(
                    historico.getId(),
                    exception.getMessage(),
                    referencia
            );
        }
    }

    private String criarAssunto() {
        return "SIMUL - Lembrete de coleta seletiva";
    }

    private String criarMensagem(
            HistoricoNotificacao historico
    ) {
        return "Olá, "
                + historico.getUsuario().getNome()
                + "! A coleta seletiva da rota "
                + historico.getRota().getNome()
                + " está prevista para "
                + historico.getDataHoraColeta()
                        .format(FORMATADOR)
                + ".";
    }

    private void validarHistorico(
            HistoricoNotificacao historico
    ) {
        if (historico == null) {
            throw new IllegalArgumentException(
                    "O histórico da notificação é obrigatório."
            );
        }

        if (historico.getId() == null) {
            throw new IllegalArgumentException(
                    "O identificador do histórico é obrigatório."
            );
        }

        if (historico.getUsuario() == null) {
            throw new IllegalArgumentException(
                    "O usuário do histórico é obrigatório."
            );
        }

        if (historico.getUsuario().getId() == null) {
            throw new IllegalArgumentException(
                    "O identificador do usuário é obrigatório."
            );
        }

        if (historico.getRota() == null) {
            throw new IllegalArgumentException(
                    "A rota do histórico é obrigatória."
            );
        }

        if (historico.getRota().getId() == null) {
            throw new IllegalArgumentException(
                    "O identificador da rota é obrigatório."
            );
        }

        if (historico.getDataHoraColeta() == null) {
            throw new IllegalArgumentException(
                    "A data e hora da coleta são obrigatórias."
            );
        }

        if (historico.getCanal() == null) {
            throw new IllegalArgumentException(
                    "O canal do histórico é obrigatório."
            );
        }
    }
}