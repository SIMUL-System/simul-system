package com.simulsystem.backend.business.notificacao.strategy;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Canal complementar: notificação do navegador (Web Push com chaves VAPID).
 * Envia para todos os navegadores inscritos do usuário; basta um aceitar
 * para o envio contar como realizado.
 */
@Component
public class WebPushNotificacaoStrategy implements NotificacaoStrategy {

    private final PushService pushService;
    private final UsuarioService usuarioService;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    public WebPushNotificacaoStrategy(
            PushService pushService,
            UsuarioService usuarioService,
            PushSubscriptionRepository pushSubscriptionRepository) {
        this.pushService = pushService;
        this.usuarioService = usuarioService;
        this.pushSubscriptionRepository = pushSubscriptionRepository;
    }

    @Override
    public CanalNotificacao getCanal() {
        return CanalNotificacao.WEB_PUSH;
    }

    @Override
    public void enviar(String destinatario, String assunto, String mensagem) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(destinatario);
        List<PushSubscription> inscricoes = pushSubscriptionRepository.findByUsuarioId(usuario.getId());

        if (inscricoes.isEmpty()) {
            throw new IllegalStateException("O usuário não possui navegador inscrito para Web Push.");
        }

        String payload = criarPayload(assunto, mensagem);
        boolean envioRealizado = false;
        Exception ultimoErro = null;

        for (PushSubscription inscricao : inscricoes) {
            try {
                Notification notificacao = new Notification(
                        inscricao.getEndpoint(), inscricao.getP256dh(), inscricao.getAuth(), payload);
                HttpResponse resposta = pushService.send(notificacao);
                int status = resposta.getStatusLine().getStatusCode();

                if (status >= 200 && status < 300) {
                    envioRealizado = true;
                } else {
                    ultimoErro = new IllegalStateException(
                            "Falha no Web Push. HTTP " + status + " - " + resposta.getStatusLine().getReasonPhrase());
                }
            } catch (Exception exception) {
                ultimoErro = exception;
            }
        }

        if (!envioRealizado) {
            String motivo = ultimoErro != null && ultimoErro.getMessage() != null && !ultimoErro.getMessage().isBlank()
                    ? " Motivo: " + ultimoErro.getMessage()
                    : "";
            throw new IllegalStateException("Não foi possível enviar a notificação Web Push." + motivo, ultimoErro);
        }
    }

    /** Monta o JSON lido pelo service worker (public/sw.js). */
    private String criarPayload(String assunto, String mensagem) {
        return "{\"title\": \"%s\", \"body\": \"%s\"}".formatted(escaparJson(assunto), escaparJson(mensagem));
    }

    private String escaparJson(String valor) {
        if (valor == null) {
            return "";
        }

        return valor
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
