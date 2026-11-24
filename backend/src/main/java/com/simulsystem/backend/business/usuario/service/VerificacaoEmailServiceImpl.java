package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.notificacao.strategy.EmailNotificacaoStrategy;
import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailResponseDTO;
import com.simulsystem.backend.business.usuario.model.TokenVerificacaoEmail;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenVerificacaoEmailRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import com.simulsystem.backend.core.config.LinkFrontend;
import com.simulsystem.backend.core.security.TokenSeguro;
import com.simulsystem.backend.core.util.Textos;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;

/** Implementação de VerificacaoEmailService. */
@Service
public class VerificacaoEmailServiceImpl implements VerificacaoEmailService {

    private final TokenVerificacaoEmailRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioValidation usuarioValidation;
    private final EmailNotificacaoStrategy emailNotificacaoStrategy;
    private final TokenSeguro tokenSeguro;
    private final LinkFrontend linkFrontend;
    private final Clock clock;
    private final long expiracaoHoras;

    public VerificacaoEmailServiceImpl(
            TokenVerificacaoEmailRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            UsuarioValidation usuarioValidation,
            EmailNotificacaoStrategy emailNotificacaoStrategy,
            TokenSeguro tokenSeguro,
            LinkFrontend linkFrontend,
            Clock clock,
            @Value("${simul.email-verification.expiration-hours:24}") long expiracaoHoras) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioValidation = usuarioValidation;
        this.emailNotificacaoStrategy = emailNotificacaoStrategy;
        this.tokenSeguro = tokenSeguro;
        this.linkFrontend = linkFrontend;
        this.clock = clock;
        this.expiracaoHoras = expiracaoHoras;
    }

    @Override
    @Transactional
    public void enviarVerificacao(Usuario usuario) {
        if (usuarioValidation.emailJaVerificado(usuario)) {
            return;
        }

        // Só o link mais recente vale.
        tokenRepository.deleteByUsuarioId(usuario.getId());

        String token = tokenSeguro.gerar();

        TokenVerificacaoEmail entidade = new TokenVerificacaoEmail();
        entidade.setUsuario(usuario);
        entidade.setTokenHash(tokenSeguro.hash(token));
        entidade.setDataExpiracao(LocalDateTime.now(clock).plusHours(expiracaoHoras));
        entidade.setUtilizado(false);
        tokenRepository.save(entidade);

        String link = linkFrontend.para("/verificar-email?token=" + token);

        emailNotificacaoStrategy.enviar(
                usuario.getEmail(), "Confirme seu e-mail no SIMUL", criarMensagem(usuario, link));
    }

    @Override
    @Transactional
    public VerificacaoEmailResponseDTO verificarEmail(String token) {
        if (token == null || token.isBlank()) {
            return new VerificacaoEmailResponseDTO(false, "O token de verificação é inválido.");
        }

        Optional<TokenVerificacaoEmail> tokenOptional = tokenRepository.findByTokenHash(tokenSeguro.hash(token.trim()));

        if (tokenOptional.isEmpty()) {
            return new VerificacaoEmailResponseDTO(
                    false, "O link de verificação é inválido ou já foi substituído por um mais recente.");
        }

        TokenVerificacaoEmail tokenVerificacao = tokenOptional.get();
        Usuario usuario = tokenVerificacao.getUsuario();

        // Link aberto de novo (página recarregada, clique duplo, pedido repetido pelo navegador):
        // se a conta já está confirmada, o resultado é o mesmo da primeira vez.
        if (Boolean.TRUE.equals(tokenVerificacao.getUtilizado())) {
            return usuarioValidation.emailJaVerificado(usuario)
                    ? new VerificacaoEmailResponseDTO(true, "Este e-mail já está confirmado.")
                    : new VerificacaoEmailResponseDTO(false, "O link de verificação já foi utilizado.");
        }

        LocalDateTime agora = LocalDateTime.now(clock);

        if (tokenVerificacao.getDataExpiracao().isBefore(agora)) {
            return new VerificacaoEmailResponseDTO(
                    false, "O link de verificação expirou. Solicite um novo e-mail de confirmação.");
        }

        if (!usuarioValidation.emailJaVerificado(usuario)) {
            usuario.setEmailVerificado(true);
            usuarioRepository.save(usuario);
        }

        tokenVerificacao.setUtilizado(true);
        tokenVerificacao.setDataUtilizacao(agora);
        tokenRepository.save(tokenVerificacao);

        return new VerificacaoEmailResponseDTO(true, "E-mail confirmado com sucesso.");
    }

    @Override
    @Transactional
    public void reenviarVerificacao(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        usuarioRepository.findByEmailIgnoreCase(Textos.normalizarEmail(email))
                .filter(usuario -> !usuarioValidation.emailJaVerificado(usuario))
                .ifPresent(this::enviarVerificacao);
    }

    private String criarMensagem(Usuario usuario, String link) {
        return """
                Olá, %s.

                Você criou uma conta no SIMUL.

                Para confirmar que este endereço de e-mail pertence a você, acesse o link abaixo:

                %s

                Este link expira em %d hora(s).

                Se você não criou esta conta, ignore esta mensagem.

                SIMUL
                Sistema Integrado de Monitoramento Urbano de Limpeza
                """.formatted(usuario.getNome(), link, expiracaoHoras);
    }
}
