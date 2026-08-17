package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.StatusNotificacao;
import com.simulsystem.backend.business.notificacao.repository.HistoricoNotificacaoRepository;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HistoricoNotificacaoServiceImpl
        implements HistoricoNotificacaoService {

    private static final int LIMITE_TENTATIVAS = 3;
    private static final long INTERVALO_RETRY_MINUTOS = 5;

    private final HistoricoNotificacaoRepository repository;

    public HistoricoNotificacaoServiceImpl(
            HistoricoNotificacaoRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public Optional<HistoricoNotificacao> reservarEnvio(
            Usuario usuario,
            Rota rota,
            LocalDateTime dataHoraColeta,
            CanalNotificacao canal
    ) {
        validarDadosReserva(
                usuario,
                rota,
                dataHoraColeta,
                canal
        );

        boolean jaExiste =
                repository.existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        usuario.getId(),
                        rota.getId(),
                        dataHoraColeta,
                        canal
                );

        if (jaExiste) {
            return Optional.empty();
        }

        HistoricoNotificacao historico =
                new HistoricoNotificacao();

        historico.setUsuario(usuario);
        historico.setRota(rota);
        historico.setDataHoraColeta(dataHoraColeta);
        historico.setCanal(canal);
        historico.setStatus(StatusNotificacao.PENDENTE);
        historico.setNumeroTentativas(0);

        try {
            return Optional.of(
                    repository.saveAndFlush(historico)
            );
        } catch (DataIntegrityViolationException exception) {
            return Optional.empty();
        }
    }

    @Override
    public void marcarComoEnviado(
            Long historicoId,
            LocalDateTime dataEnvio
    ) {
        if (historicoId == null) {
            throw new IllegalArgumentException(
                    "O identificador do histórico é obrigatório."
            );
        }

        if (dataEnvio == null) {
            throw new IllegalArgumentException(
                    "A data de envio é obrigatória."
            );
        }

        HistoricoNotificacao historico =
                buscarPorId(historicoId);

        incrementarTentativas(historico);

        historico.setStatus(StatusNotificacao.ENVIADO);
        historico.setDataEnvio(dataEnvio);
        historico.setProximaTentativa(null);
        historico.setMensagemErro(null);

        repository.save(historico);
    }

    @Override
    public void marcarComoFalha(
            Long historicoId,
            String mensagemErro,
            LocalDateTime referencia
    ) {
        if (historicoId == null) {
            throw new IllegalArgumentException(
                    "O identificador do histórico é obrigatório."
            );
        }

        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        HistoricoNotificacao historico =
                buscarPorId(historicoId);

        incrementarTentativas(historico);

        historico.setStatus(StatusNotificacao.FALHA);
        historico.setDataEnvio(null);
        historico.setMensagemErro(
                limitarMensagemErro(mensagemErro)
        );

        if (historico.getNumeroTentativas() < LIMITE_TENTATIVAS) {
            historico.setProximaTentativa(
                    referencia.plusMinutes(
                            INTERVALO_RETRY_MINUTOS
                    )
            );
        } else {
            historico.setProximaTentativa(null);
        }

        repository.save(historico);
    }

    @Override
    public void marcarComoCancelado(
            Long historicoId
    ) {
        if (historicoId == null) {
            throw new IllegalArgumentException(
                    "O identificador do histórico é obrigatório."
            );
        }

        HistoricoNotificacao historico =
                buscarPorId(historicoId);

        historico.setStatus(
                StatusNotificacao.CANCELADO
        );

        historico.setProximaTentativa(null);
        historico.setDataEnvio(null);
        historico.setMensagemErro(null);

        /*
         * Não incrementamos numeroTentativas.
         *
         * CANCELADO representa mudança da configuração
         * atual do usuário/rota, não uma tentativa de
         * transporte.
         */
        repository.save(historico);
    }

    @Override
    public List<HistoricoNotificacao> buscarFalhasElegiveisParaRetry(
            LocalDateTime referencia
    ) {
        if (referencia == null) {
            throw new IllegalArgumentException(
                    "A data e hora de referência são obrigatórias."
            );
        }

        return repository.buscarFalhasElegiveisParaRetry(
                StatusNotificacao.FALHA,
                referencia,
                LIMITE_TENTATIVAS
        );
    }

    private HistoricoNotificacao buscarPorId(
            Long historicoId
    ) {
        return repository.findById(historicoId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Histórico de notificação não encontrado."
                        )
                );
    }

    private void incrementarTentativas(
            HistoricoNotificacao historico
    ) {
        int tentativasAtuais =
                historico.getNumeroTentativas() == null
                        ? 0
                        : historico.getNumeroTentativas();

        int novaQuantidade =
                Math.min(
                        tentativasAtuais + 1,
                        LIMITE_TENTATIVAS
                );

        historico.setNumeroTentativas(
                novaQuantidade
        );
    }

    private void validarDadosReserva(
            Usuario usuario,
            Rota rota,
            LocalDateTime dataHoraColeta,
            CanalNotificacao canal
    ) {
        if (usuario == null || usuario.getId() == null) {
            throw new IllegalArgumentException(
                    "O usuário é obrigatório."
            );
        }

        if (rota == null || rota.getId() == null) {
            throw new IllegalArgumentException(
                    "A rota é obrigatória."
            );
        }

        if (dataHoraColeta == null) {
            throw new IllegalArgumentException(
                    "A data e hora da coleta são obrigatórias."
            );
        }

        if (canal == null) {
            throw new IllegalArgumentException(
                    "O canal da notificação é obrigatório."
            );
        }
    }

    private String limitarMensagemErro(
            String mensagemErro
    ) {
        if (mensagemErro == null || mensagemErro.isBlank()) {
            return "Falha no envio da notificação.";
        }

        String mensagem = mensagemErro.trim();

        if (mensagem.length() <= 500) {
            return mensagem;
        }

        return mensagem.substring(0, 500);
    }
}