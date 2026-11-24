package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.notificacao.strategy.EmailNotificacaoStrategy;
import com.simulsystem.backend.business.usuario.dto.RecuperacaoSenhaResponseDTO;
import com.simulsystem.backend.business.usuario.dto.RedefinicaoSenhaRequestDTO;
import com.simulsystem.backend.business.usuario.model.TokenRecuperacaoSenha;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenRecuperacaoSenhaRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import com.simulsystem.backend.core.config.LinkFrontend;
import com.simulsystem.backend.core.security.TokenSeguro;
import com.simulsystem.backend.core.util.Textos;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;

/** Implementação de RecuperacaoSenhaService. */
@Service
public class RecuperacaoSenhaServiceImpl implements RecuperacaoSenhaService {

    private final TokenRecuperacaoSenhaRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioValidation usuarioValidation;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificacaoStrategy emailNotificacaoStrategy;
    private final TokenSeguro tokenSeguro;
    private final LinkFrontend linkFrontend;
    private final Clock clock;
    private final long expiracaoMinutos;

    public RecuperacaoSenhaServiceImpl(
            TokenRecuperacaoSenhaRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            UsuarioValidation usuarioValidation,
            PasswordEncoder passwordEncoder,
            EmailNotificacaoStrategy emailNotificacaoStrategy,
            TokenSeguro tokenSeguro,
            LinkFrontend linkFrontend,
            Clock clock,
            @Value("${simul.password-recovery.expiration-minutes:60}") long expiracaoMinutos) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioValidation = usuarioValidation;
        this.passwordEncoder = passwordEncoder;
        this.emailNotificacaoStrategy = emailNotificacaoStrategy;
        this.tokenSeguro = tokenSeguro;
        this.linkFrontend = linkFrontend;
        this.clock = clock;
        this.expiracaoMinutos = expiracaoMinutos;
    }

    @Override
    @Transactional
    public void solicitarRecuperacao(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmailIgnoreCase(Textos.normalizarEmail(email));

        // E-mail inexistente ou conta inativa: não faz nada, e a resposta ao cliente continua neutra.
        if (usuarioOptional.isEmpty() || !Boolean.TRUE.equals(usuarioOptional.get().getAtivo())) {
            return;
        }

        Usuario usuario = usuarioOptional.get();

        // Só o link mais recente vale.
        tokenRepository.deleteByUsuarioId(usuario.getId());

        String token = tokenSeguro.gerar();

        TokenRecuperacaoSenha entidade = new TokenRecuperacaoSenha();
        entidade.setUsuario(usuario);
        entidade.setTokenHash(tokenSeguro.hash(token));
        entidade.setDataExpiracao(LocalDateTime.now(clock).plusMinutes(expiracaoMinutos));
        entidade.setUtilizado(false);
        tokenRepository.save(entidade);

        String link = linkFrontend.para("/redefinir-senha?token=" + token);

        emailNotificacaoStrategy.enviar(
                usuario.getEmail(), "Recuperação de senha do SIMUL", criarMensagem(usuario, link));
    }

    @Override
    @Transactional
    public RecuperacaoSenhaResponseDTO redefinirSenha(RedefinicaoSenhaRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.token() == null || requestDTO.token().isBlank()) {
            return new RecuperacaoSenhaResponseDTO(false, "O link de recuperação é inválido.");
        }

        if (!usuarioValidation.senhasCoincidem(requestDTO.novaSenha(), requestDTO.confirmacaoSenha())) {
            return new RecuperacaoSenhaResponseDTO(false, "A nova senha e a confirmação não coincidem.");
        }

        Optional<TokenRecuperacaoSenha> tokenOptional =
                tokenRepository.findByTokenHashAndUtilizadoFalse(tokenSeguro.hash(requestDTO.token().trim()));

        if (tokenOptional.isEmpty()) {
            return new RecuperacaoSenhaResponseDTO(false, "O link de recuperação é inválido ou já foi utilizado.");
        }

        TokenRecuperacaoSenha tokenRecuperacao = tokenOptional.get();
        LocalDateTime agora = LocalDateTime.now(clock);

        if (tokenRecuperacao.getDataExpiracao().isBefore(agora)) {
            return new RecuperacaoSenhaResponseDTO(
                    false, "O link de recuperação expirou. Solicite uma nova recuperação de senha.");
        }

        Usuario usuario = tokenRecuperacao.getUsuario();

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            return new RecuperacaoSenhaResponseDTO(false, "Não foi possível redefinir a senha desta conta.");
        }

        usuario.setSenha(passwordEncoder.encode(requestDTO.novaSenha()));
        usuarioRepository.save(usuario);

        // O link deixa de valer assim que a senha é trocada.
        tokenRecuperacao.setUtilizado(true);
        tokenRecuperacao.setDataUtilizacao(agora);
        tokenRepository.save(tokenRecuperacao);

        return new RecuperacaoSenhaResponseDTO(true, "Senha redefinida com sucesso.");
    }

    private String criarMensagem(Usuario usuario, String link) {
        return """
                Olá, %s.

                Recebemos uma solicitação para redefinir a senha da sua conta no SIMUL.

                Para criar uma nova senha, acesse o link abaixo:

                %s

                Este link expira em %d minuto(s) e poderá ser utilizado apenas uma vez.

                Se você não solicitou a redefinição de senha, ignore esta mensagem. Sua senha atual continuará válida.

                SIMUL
                Sistema Integrado de Monitoramento Urbano de Limpeza
                """.formatted(usuario.getNome(), link, expiracaoMinutos);
    }
}
