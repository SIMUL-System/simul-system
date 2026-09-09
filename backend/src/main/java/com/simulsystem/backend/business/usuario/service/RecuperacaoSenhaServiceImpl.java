package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.notificacao.strategy.EmailNotificacaoStrategy;
import com.simulsystem.backend.business.usuario.dto.RecuperacaoSenhaResponseDTO;
import com.simulsystem.backend.business.usuario.dto.RedefinicaoSenhaRequestDTO;
import com.simulsystem.backend.business.usuario.model.TokenRecuperacaoSenha;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenRecuperacaoSenhaRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@Service
public class RecuperacaoSenhaServiceImpl
        implements RecuperacaoSenhaService {

    private static final int TOKEN_BYTES = 32;

    private final TokenRecuperacaoSenhaRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioValidation usuarioValidation;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificacaoStrategy emailNotificacaoStrategy;

    private final SecureRandom secureRandom;

    private final long expiracaoMinutos;
    private final String frontendUrl;

    public RecuperacaoSenhaServiceImpl(
            TokenRecuperacaoSenhaRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            UsuarioValidation usuarioValidation,
            PasswordEncoder passwordEncoder,
            EmailNotificacaoStrategy emailNotificacaoStrategy,
            @Value("${simul.password-recovery.expiration-minutes:60}")
            long expiracaoMinutos,
            @Value("${simul.frontend.url}")
            String frontendUrl
    ) {
        this.tokenRepository =
                tokenRepository;

        this.usuarioRepository =
                usuarioRepository;

        this.usuarioValidation =
                usuarioValidation;

        this.passwordEncoder =
                passwordEncoder;

        this.emailNotificacaoStrategy =
                emailNotificacaoStrategy;

        this.expiracaoMinutos =
                expiracaoMinutos;

        this.frontendUrl =
                removerBarraFinal(
                        frontendUrl
                );

        this.secureRandom =
                new SecureRandom();
    }

    @Override
    @Transactional
    public void solicitarRecuperacao(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            return;
        }

        String emailNormalizado =
                normalizarEmail(
                        email
                );

        Optional<Usuario> usuarioOptional =
                usuarioRepository
                        .findByEmailIgnoreCase(
                                emailNormalizado
                        );

        /*
         * A ausência do usuário não gera erro propositalmente.
         *
         * O Controller responderá sempre de forma neutra,
         * evitando que terceiros descubram quais e-mails
         * estão cadastrados no SIMUL.
         */
        if (usuarioOptional.isEmpty()) {
            return;
        }

        Usuario usuario =
                usuarioOptional.get();

        /*
         * Contas inativas não recebem recuperação.
         *
         * A resposta externa continuará neutra.
         */
        if (
                !Boolean.TRUE.equals(
                        usuario.getAtivo()
                )
        ) {
            return;
        }

        /*
         * Qualquer token anterior desse usuário é removido.
         *
         * Dessa forma, apenas o link de recuperação mais
         * recente permanece válido.
         */
        tokenRepository
                .deleteByUsuarioId(
                        usuario.getId()
                );

        String token =
                gerarTokenSeguro();

        String tokenHash =
                gerarHashToken(
                        token
                );

        TokenRecuperacaoSenha entidade =
                new TokenRecuperacaoSenha();

        entidade.setUsuario(
                usuario
        );

        entidade.setTokenHash(
                tokenHash
        );

        entidade.setDataExpiracao(
                LocalDateTime.now()
                        .plusMinutes(
                                expiracaoMinutos
                        )
        );

        entidade.setUtilizado(
                false
        );

        tokenRepository.save(
                entidade
        );

        String link =
                frontendUrl
                        + "/redefinir-senha?token="
                        + token;

        String assunto =
                "Recuperação de senha do SIMUL";

        String mensagem =
                criarMensagemRecuperacao(
                        usuario,
                        link
                );

        emailNotificacaoStrategy.enviar(
                usuario.getEmail(),
                assunto,
                mensagem
        );
    }

    @Override
    @Transactional
    public RecuperacaoSenhaResponseDTO redefinirSenha(
            RedefinicaoSenhaRequestDTO requestDTO
    ) {
        if (
                requestDTO == null ||
                requestDTO.token() == null ||
                requestDTO.token().isBlank()
        ) {
            return new RecuperacaoSenhaResponseDTO(
                    false,
                    "O link de recuperação é inválido."
            );
        }

        if (
                !usuarioValidation
                        .senhasCoincidem(
                                requestDTO.novaSenha(),
                                requestDTO.confirmacaoSenha()
                        )
        ) {
            return new RecuperacaoSenhaResponseDTO(
                    false,
                    "A nova senha e a confirmação não coincidem."
            );
        }

        String tokenHash =
                gerarHashToken(
                        requestDTO.token()
                                .trim()
                );

        Optional<TokenRecuperacaoSenha> tokenOptional =
                tokenRepository
                        .findByTokenHashAndUtilizadoFalse(
                                tokenHash
                        );

        if (tokenOptional.isEmpty()) {
            return new RecuperacaoSenhaResponseDTO(
                    false,
                    "O link de recuperação é inválido ou já foi utilizado."
            );
        }

        TokenRecuperacaoSenha tokenRecuperacao =
                tokenOptional.get();

        LocalDateTime agora =
                LocalDateTime.now();

        if (
                tokenRecuperacao
                        .getDataExpiracao()
                        .isBefore(
                                agora
                        )
        ) {
            return new RecuperacaoSenhaResponseDTO(
                    false,
                    "O link de recuperação expirou. Solicite uma nova recuperação de senha."
            );
        }

        Usuario usuario =
                tokenRecuperacao
                        .getUsuario();

        if (
                !Boolean.TRUE.equals(
                        usuario.getAtivo()
                )
        ) {
            return new RecuperacaoSenhaResponseDTO(
                    false,
                    "Não foi possível redefinir a senha desta conta."
            );
        }

        String novaSenhaCriptografada =
                passwordEncoder.encode(
                        requestDTO.novaSenha()
                );

        usuario.setSenha(
                novaSenhaCriptografada
        );

        usuarioRepository.save(
                usuario
        );

        /*
         * O token é invalidado imediatamente depois
         * da alteração da senha.
         */
        tokenRecuperacao.setUtilizado(
                true
        );

        tokenRecuperacao.setDataUtilizacao(
                agora
        );

        tokenRepository.save(
                tokenRecuperacao
        );

        return new RecuperacaoSenhaResponseDTO(
                true,
                "Senha redefinida com sucesso."
        );
    }

    private String gerarTokenSeguro() {
        byte[] bytes =
                new byte[
                        TOKEN_BYTES
                ];

        secureRandom.nextBytes(
                bytes
        );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        bytes
                );
    }

    private String gerarHashToken(
            String token
    ) {
        try {
            MessageDigest digest =
                    MessageDigest
                            .getInstance(
                                    "SHA-256"
                            );

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat
                    .of()
                    .formatHex(
                            hash
                    );

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "Não foi possível gerar o hash do token de recuperação de senha.",
                    exception
            );
        }
    }

    private String criarMensagemRecuperacao(
            Usuario usuario,
            String link
    ) {
        return """
                Olá, %s.

                Recebemos uma solicitação para redefinir a senha da sua conta no SIMUL.

                Para criar uma nova senha, acesse o link abaixo:

                %s

                Este link expira em %d minuto(s) e poderá ser utilizado apenas uma vez.

                Se você não solicitou a redefinição de senha, ignore esta mensagem. Sua senha atual continuará válida.

                SIMUL
                Sistema Integrado de Monitoramento Urbano de Limpeza
                """
                .formatted(
                        usuario.getNome(),
                        link,
                        expiracaoMinutos
                );
    }

    private String normalizarEmail(
            String email
    ) {
        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String removerBarraFinal(
            String url
    ) {
        if (
                url == null ||
                url.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "A URL do frontend não foi configurada."
            );
        }

        return url.replaceAll(
                "/+$",
                ""
        );
    }
}