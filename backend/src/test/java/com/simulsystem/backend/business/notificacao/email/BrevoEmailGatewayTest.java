package com.simulsystem.backend.business.notificacao.email;

import com.simulsystem.backend.core.exception.EnvioEmailException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class BrevoEmailGatewayTest {

    private MockRestServiceServer servidor;
    private BrevoEmailGateway gateway;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(builder).build();
        gateway = new BrevoEmailGateway(builder, "chave-teste", "simul.sistema@gmail.com", "SIMUL");
    }

    @Test
    void deveEnviarPelaApiComChaveRemetenteEDestinatario() {
        servidor.expect(requestTo(BrevoEmailGateway.URL_ENVIO))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "chave-teste"))
                .andExpect(jsonPath("$.sender.email").value("simul.sistema@gmail.com"))
                .andExpect(jsonPath("$.sender.name").value("SIMUL"))
                .andExpect(jsonPath("$.to[0].email").value("morador@exemplo.com"))
                .andExpect(jsonPath("$.subject").value("Confirme seu e-mail no SIMUL"))
                .andExpect(jsonPath("$.textContent").value("Olá"))
                .andRespond(withSuccess("{\"messageId\":\"<1@brevo>\"}", MediaType.APPLICATION_JSON));

        gateway.enviar("morador@exemplo.com", "Confirme seu e-mail no SIMUL", "Olá");

        servidor.verify();
    }

    @Test
    void deveLancarEnvioEmailExceptionQuandoBrevoRecusar() {
        servidor.expect(requestTo(BrevoEmailGateway.URL_ENVIO))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThrows(EnvioEmailException.class, () -> gateway.enviar("morador@exemplo.com", "Assunto", "Texto"));
    }

    @Test
    void naoDeveIniciarSemChaveDaApi() {
        assertThrows(
                IllegalStateException.class,
                () -> new BrevoEmailGateway(RestClient.builder(), " ", "a@b.com", "SIMUL")
        );
    }
}
