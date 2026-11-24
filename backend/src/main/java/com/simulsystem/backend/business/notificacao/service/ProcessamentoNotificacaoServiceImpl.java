package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/** Implementação de ProcessamentoNotificacaoService. */
@Service
public class ProcessamentoNotificacaoServiceImpl implements ProcessamentoNotificacaoService {

    private final DecisaoNotificacaoService decisaoNotificacaoService;
    private final HistoricoNotificacaoService historicoNotificacaoService;
    private final EnvioNotificacaoService envioNotificacaoService;
    private final MensagemLembrete mensagemLembrete;

    public ProcessamentoNotificacaoServiceImpl(
            DecisaoNotificacaoService decisaoNotificacaoService,
            HistoricoNotificacaoService historicoNotificacaoService,
            EnvioNotificacaoService envioNotificacaoService,
            MensagemLembrete mensagemLembrete) {
        this.decisaoNotificacaoService = decisaoNotificacaoService;
        this.historicoNotificacaoService = historicoNotificacaoService;
        this.envioNotificacaoService = envioNotificacaoService;
        this.mensagemLembrete = mensagemLembrete;
    }

    @Override
    public void processar(PreferenciaNotificacao preferencia, LocalDateTime referencia) {
        validarDados(preferencia, referencia);

        Optional<LocalDateTime> coletaDoLembrete =
                decisaoNotificacaoService.buscarColetaParaLembrete(preferencia, referencia);

        if (coletaDoLembrete.isEmpty()) {
            return;
        }

        LocalDateTime dataHoraColeta = coletaDoLembrete.get();

        if (Boolean.TRUE.equals(preferencia.getEmailAtivo())) {
            processarCanal(preferencia, dataHoraColeta, referencia, CanalNotificacao.EMAIL);
        }

        if (Boolean.TRUE.equals(preferencia.getWebPushAtivo())) {
            processarCanal(preferencia, dataHoraColeta, referencia, CanalNotificacao.WEB_PUSH);
        }
    }

    /**
     * Reserva o envio no histórico (a restrição única do banco impede lembrete
     * duplicado) e só então envia. Falha de envio vira FALHA com nova tentativa.
     */
    private void processarCanal(
            PreferenciaNotificacao preferencia,
            LocalDateTime dataHoraColeta,
            LocalDateTime referencia,
            CanalNotificacao canal) {
        Optional<HistoricoNotificacao> reserva = historicoNotificacaoService.reservarEnvio(
                preferencia.getUsuario(), preferencia.getRota(), dataHoraColeta, canal);

        if (reserva.isEmpty()) {
            return;
        }

        Long historicoId = reserva.get().getId();

        try {
            envioNotificacaoService.enviar(
                    canal,
                    preferencia.getUsuario().getEmail(),
                    mensagemLembrete.assunto(),
                    mensagemLembrete.texto(
                            preferencia.getUsuario().getNome(), preferencia.getRota().getNome(), dataHoraColeta));
            historicoNotificacaoService.marcarComoEnviado(historicoId, referencia);
        } catch (RuntimeException exception) {
            historicoNotificacaoService.marcarComoFalha(historicoId, mensagemDoErro(exception), referencia);
        }
    }

    private String mensagemDoErro(RuntimeException exception) {
        String mensagem = exception.getMessage();
        return mensagem != null && !mensagem.isBlank() ? mensagem : exception.getClass().getSimpleName();
    }

    private void validarDados(PreferenciaNotificacao preferencia, LocalDateTime referencia) {
        if (preferencia == null) {
            throw new IllegalArgumentException("A preferência de notificação é obrigatória.");
        }

        if (preferencia.getUsuario() == null) {
            throw new IllegalArgumentException("O usuário da preferência é obrigatório.");
        }

        if (preferencia.getRota() == null) {
            throw new IllegalArgumentException("A rota da preferência é obrigatória.");
        }

        if (referencia == null) {
            throw new IllegalArgumentException("A data e hora de referência são obrigatórias.");
        }
    }
}
