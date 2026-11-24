package com.simulsystem.backend.core.config;

import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.GeneralSecurityException;
import java.security.Security;

/**
 * Cliente de Web Push assinado com as chaves VAPID.
 * As três variáveis são obrigatórias: sem elas a aplicação não sobe.
 */
@Configuration
public class WebPushConfig {

    @Bean
    public PushService pushService(
            @Value("${simul.webpush.vapid.public-key}") String chavePublica,
            @Value("${simul.webpush.vapid.private-key}") String chavePrivada,
            @Value("${simul.webpush.vapid.subject}") String subject) throws GeneralSecurityException {
        // A biblioteca de Web Push usa a criptografia de curva elíptica do Bouncy Castle.
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        exigir(chavePublica, "A chave pública VAPID (WEB_PUSH_VAPID_PUBLIC_KEY) não foi configurada.");
        exigir(chavePrivada, "A chave privada VAPID (WEB_PUSH_VAPID_PRIVATE_KEY) não foi configurada.");
        exigir(subject, "O subject VAPID (WEB_PUSH_VAPID_SUBJECT) não foi configurado.");

        return new PushService(chavePublica, chavePrivada, subject);
    }

    private static void exigir(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalStateException(mensagem);
        }
    }
}
