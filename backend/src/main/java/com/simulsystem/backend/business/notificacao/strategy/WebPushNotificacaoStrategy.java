package com.simulsystem.backend.business.notificacao.strategy;

import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebPushNotificacaoStrategy
        implements NotificacaoStrategy {

    private final PushService pushService;
    private final UsuarioService usuarioService;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    public WebPushNotificacaoStrategy(
            PushService pushService,
            UsuarioService usuarioService,
            PushSubscriptionRepository pushSubscriptionRepository
    ) {
        this.pushService = pushService;
        this.usuarioService = usuarioService;
        this.pushSubscriptionRepository = pushSubscriptionRepository;
    }

    @Override
    public TipoNotificacao getTipo() {
        return TipoNotificacao.WEB_PUSH;
    }

    @Override
    public void enviar(
            String destinatario,
            String assunto,
            String mensagem
    ) {
        Usuario usuario =
                usuarioService.buscarEntidadePorEmail(
                        destinatario
                );

        List<PushSubscription> subscriptions =
                pushSubscriptionRepository.findByUsuarioId(
                        usuario.getId()
                );

        if (subscriptions.isEmpty()) {
            throw new IllegalStateException(
                    "O usuário não possui navegador inscrito para Web Push."
            );
        }

        String payload =
                criarPayload(
                        assunto,
                        mensagem
                );

        boolean envioRealizado = false;
        Exception ultimoErro = null;

        for (
                PushSubscription subscription
                : subscriptions
        ) {
            try {
                Notification notification =
                        new Notification(
                                subscription.getEndpoint(),
                                subscription.getP256dh(),
                                subscription.getAuth(),
                                payload
                        );

                HttpResponse response =
                        pushService.send(
                                notification
                        );

                int statusCode =
                        response
                                .getStatusLine()
                                .getStatusCode();

                if (
                        statusCode >= 200
                        && statusCode < 300
                ) {
                    envioRealizado = true;
                    continue;
                }

                String motivo =
                        response
                                .getStatusLine()
                                .getReasonPhrase();

                ultimoErro =
                        new IllegalStateException(
                                "Falha no Web Push. HTTP "
                                        + statusCode
                                        + " - "
                                        + motivo
                        );

            } catch (Exception exception) {
                ultimoErro = exception;
            }
        }

        if (!envioRealizado) {
            String mensagemErro =
                    "Não foi possível enviar a notificação Web Push.";

            if (
                    ultimoErro != null
                    && ultimoErro.getMessage() != null
                    && !ultimoErro.getMessage().isBlank()
            ) {
                mensagemErro +=
                        " Motivo: "
                                + ultimoErro.getMessage();
            }

            throw new IllegalStateException(
                    mensagemErro,
                    ultimoErro
            );
        }
    }

    private String criarPayload(
            String assunto,
            String mensagem
    ) {
        return """
                {
                  "title": "%s",
                  "body": "%s"
                }
                """
                .formatted(
                        escaparJson(assunto),
                        escaparJson(mensagem)
                );
    }

    private String escaparJson(
            String valor
    ) {
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