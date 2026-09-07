package com.simulsystem.backend.core.config;

import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.Security;

@Configuration
public class WebPushConfig {

    @Value("${simul.webpush.vapid.public-key}")
    private String publicKey;

    @Value("${simul.webpush.vapid.private-key}")
    private String privateKey;

    @Value("${simul.webpush.vapid.subject}")
    private String subject;

    @Bean
    public PushService pushService()
            throws Exception {

        if (
                Security.getProvider("BC")
                        == null
        ) {
            Security.addProvider(
                    new BouncyCastleProvider()
            );
        }

        if (
                publicKey == null ||
                publicKey.isBlank()
        ) {
            throw new IllegalStateException(
                    "A chave pública VAPID não foi configurada."
            );
        }

        if (
                privateKey == null ||
                privateKey.isBlank()
        ) {
            throw new IllegalStateException(
                    "A chave privada VAPID não foi configurada."
            );
        }

        if (
                subject == null ||
                subject.isBlank()
        ) {
            throw new IllegalStateException(
                    "O subject VAPID não foi configurado."
            );
        }

        return new PushService(
                publicKey,
                privateKey,
                subject
        );
    }
}