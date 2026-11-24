package com.simulsystem.backend.business.notificacao.email;

import com.simulsystem.backend.core.exception.EnvioEmailException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Envio pela API HTTPS do Brevo (porta 443), que a Render gratuita
 * não bloqueia. Plano gratuito: 300 e-mails por dia.
 * Documentação: POST https://api.brevo.com/v3/smtp/email
 */
@Component
@ConditionalOnProperty(
        name = "simul.mail.provedor",
        havingValue = "brevo"
)
public class BrevoEmailGateway implements EmailGateway {

    static final String URL_ENVIO = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient;
    private final String remetente;
    private final String nomeRemetente;

    @Autowired
    public BrevoEmailGateway(
            @Value("${simul.mail.brevo.api-key}") String apiKey,
            @Value("${simul.mail.remetente}") String remetente,
            @Value("${simul.mail.nome-remetente:SIMUL}") String nomeRemetente
    ) {
        this(criarBuilderPadrao(), apiKey, remetente, nomeRemetente);
    }

    /** Usado nos testes, com um servidor HTTP simulado. */
    BrevoEmailGateway(
            RestClient.Builder builder,
            String apiKey,
            String remetente,
            String nomeRemetente
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "BREVO_API_KEY é obrigatória quando SIMUL_MAIL_PROVEDOR=brevo."
            );
        }

        this.restClient = builder
                .defaultHeader("api-key", apiKey)
                .defaultHeader("accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.remetente = remetente;
        this.nomeRemetente = nomeRemetente;
    }

    private static RestClient.Builder criarBuilderPadrao() {
        SimpleClientHttpRequestFactory fabrica =
                new SimpleClientHttpRequestFactory();

        fabrica.setConnectTimeout(Duration.ofSeconds(10));
        fabrica.setReadTimeout(Duration.ofSeconds(15));

        return RestClient.builder().requestFactory(fabrica);
    }

    @Override
    public void enviar(
            String destinatario,
            String assunto,
            String texto
    ) {
        Map<String, Object> corpo = Map.of(
                "sender", Map.of("name", nomeRemetente, "email", remetente),
                "to", List.of(Map.of("email", destinatario)),
                "subject", assunto,
                "textContent", texto
        );

        try {
            restClient.post()
                    .uri(URL_ENVIO)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(corpo)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw new EnvioEmailException(
                    "Não foi possível enviar o e-mail pelo Brevo.",
                    exception
            );
        }
    }
}
