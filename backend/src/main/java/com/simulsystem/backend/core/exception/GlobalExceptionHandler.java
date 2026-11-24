package com.simulsystem.backend.core.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Converte as exceções da aplicação em respostas ProblemDetail (RFC 9457),
 * para que nenhuma regra de negócio chegue ao cliente como erro 500.
 * Os títulos são estáveis: o front-end usa alguns deles para decidir o que mostrar.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /* ---------- 400: dados inválidos ---------- */

    /** Falha de Bean Validation no corpo da requisição (@Valid). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidacao(MethodArgumentNotValidException exception) {
        Map<String, String> erros = new LinkedHashMap<>();

        for (FieldError erro : exception.getBindingResult().getFieldErrors()) {
            erros.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }

        String detalhe = erros.isEmpty()
                ? "Os dados enviados são inválidos."
                : erros.values().iterator().next();

        ProblemDetail problem = criar(HttpStatus.BAD_REQUEST, "Dados inválidos", detalhe);
        problem.setProperty("erros", erros);
        return problem;
    }

    /** JSON malformado ou valor que não converte (ex.: dia da semana inexistente). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleCorpoIlegivel(HttpMessageNotReadableException exception) {
        return criar(HttpStatus.BAD_REQUEST, "Dados inválidos",
                "O corpo da requisição está mal formatado ou contém valores inválidos.");
    }

    /** Parâmetro obrigatório ausente na URL. */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleParametroAusente(MissingServletRequestParameterException exception) {
        return criar(HttpStatus.BAD_REQUEST, "Parâmetro obrigatório ausente",
                "Informe o parâmetro '" + exception.getParameterName() + "'.");
    }

    @ExceptionHandler(HorarioCronogramaInvalidoException.class)
    public ProblemDetail handleHorarioCronogramaInvalido(HorarioCronogramaInvalidoException exception) {
        return criar(HttpStatus.BAD_REQUEST, "Horário do cronograma inválido", exception.getMessage());
    }

    @ExceptionHandler(GeometriaGeoJsonInvalidaException.class)
    public ProblemDetail handleGeometriaInvalida(GeometriaGeoJsonInvalidaException exception) {
        return criar(HttpStatus.BAD_REQUEST, "Geometria inválida", exception.getMessage());
    }

    /* ---------- 401 / 403: autenticação ---------- */

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ProblemDetail handleCredenciaisInvalidas(CredenciaisInvalidasException exception) {
        return criar(HttpStatus.UNAUTHORIZED, "Credenciais inválidas", exception.getMessage());
    }

    @ExceptionHandler(EmailNaoVerificadoException.class)
    public ProblemDetail handleEmailNaoVerificado(EmailNaoVerificadoException exception) {
        return criar(HttpStatus.FORBIDDEN, "E-mail não verificado", exception.getMessage());
    }

    /* ---------- 404: recurso inexistente ---------- */

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ProblemDetail handleUsuarioNaoEncontrado(UsuarioNaoEncontradoException exception) {
        return criar(HttpStatus.NOT_FOUND, "Usuário não encontrado", exception.getMessage());
    }

    @ExceptionHandler(AreaAtendidaNaoEncontradaException.class)
    public ProblemDetail handleAreaAtendidaNaoEncontrada(AreaAtendidaNaoEncontradaException exception) {
        return criar(HttpStatus.NOT_FOUND, "Área atendida não encontrada", exception.getMessage());
    }

    @ExceptionHandler(RotaNaoEncontradaException.class)
    public ProblemDetail handleRotaNaoEncontrada(RotaNaoEncontradaException exception) {
        return criar(HttpStatus.NOT_FOUND, "Rota não encontrada", exception.getMessage());
    }

    @ExceptionHandler(CronogramaNaoEncontradoException.class)
    public ProblemDetail handleCronogramaNaoEncontrado(CronogramaNaoEncontradoException exception) {
        return criar(HttpStatus.NOT_FOUND, "Cronograma não encontrado", exception.getMessage());
    }

    @ExceptionHandler(PreferenciaNotificacaoNaoEncontradaException.class)
    public ProblemDetail handlePreferenciaNotificacaoNaoEncontrada(
            PreferenciaNotificacaoNaoEncontradaException exception) {
        return criar(HttpStatus.NOT_FOUND, "Preferência de notificação não encontrada", exception.getMessage());
    }

    @ExceptionHandler(PushSubscriptionNaoEncontradaException.class)
    public ProblemDetail handlePushSubscriptionNaoEncontrada(PushSubscriptionNaoEncontradaException exception) {
        return criar(HttpStatus.NOT_FOUND, "Inscrição do navegador não encontrada", exception.getMessage());
    }

    /* ---------- 409: conflito com o que já existe ---------- */

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ProblemDetail handleEmailJaCadastrado(EmailJaCadastradoException exception) {
        return criar(HttpStatus.CONFLICT, "E-mail já cadastrado", exception.getMessage());
    }

    @ExceptionHandler(AreaAtendidaJaCadastradaException.class)
    public ProblemDetail handleAreaAtendidaJaCadastrada(AreaAtendidaJaCadastradaException exception) {
        return criar(HttpStatus.CONFLICT, "Área atendida já cadastrada", exception.getMessage());
    }

    @ExceptionHandler(CronogramaJaCadastradoException.class)
    public ProblemDetail handleCronogramaJaCadastrado(CronogramaJaCadastradoException exception) {
        return criar(HttpStatus.CONFLICT, "Cronograma já cadastrado", exception.getMessage());
    }

    @ExceptionHandler(PreferenciaNotificacaoJaCadastradaException.class)
    public ProblemDetail handlePreferenciaNotificacaoJaCadastrada(
            PreferenciaNotificacaoJaCadastradaException exception) {
        return criar(HttpStatus.CONFLICT, "Preferência de notificação já cadastrada", exception.getMessage());
    }

    @ExceptionHandler(PushSubscriptionEmUsoException.class)
    public ProblemDetail handlePushSubscriptionEmUso(PushSubscriptionEmUsoException exception) {
        return criar(HttpStatus.CONFLICT, "Navegador já inscrito", exception.getMessage());
    }

    /* ---------- 503: serviço externo ---------- */

    /** O pedido era válido, mas o provedor de e-mail não respondeu agora. */
    @ExceptionHandler(EnvioEmailException.class)
    public ProblemDetail handleEnvioEmail(EnvioEmailException exception) {
        // A causa técnica (timeout, chave inválida, porta bloqueada) fica só no log.
        LOG.error("Falha no envio de e-mail: {}", exception.getMessage(), exception);

        return criar(HttpStatus.SERVICE_UNAVAILABLE, "E-mail não enviado",
                "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.");
    }

    private ProblemDetail criar(HttpStatus status, String titulo, String detalhe) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detalhe);
        problem.setTitle(titulo);
        return problem;
    }
}
