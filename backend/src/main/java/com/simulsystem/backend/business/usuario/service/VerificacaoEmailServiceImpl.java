package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.notificacao.strategy.EmailNotificacaoStrategy;
import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailResponseDTO;
import com.simulsystem.backend.business.usuario.model.TokenVerificacaoEmail;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenVerificacaoEmailRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import org.springframework.beans.factory.annotation.Value;
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
public class VerificacaoEmailServiceImpl
        implements VerificacaoEmailService {

    private static final int TOKEN_BYTES = 32;

    private final TokenVerificacaoEmailRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioValidation usuarioValidation;
    private final EmailNotificacaoStrategy emailNotificacaoStrategy;

    private final SecureRandom secureRandom;

    private final long expiracaoHoras;
    private final String frontendUrl;

    public VerificacaoEmailServiceImpl(
            TokenVerificacaoEmailRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            UsuarioValidation usuarioValidation,
            EmailNotificacaoStrategy emailNotificacaoStrategy,
            @Value("${simul.email-verification.expiration-hours:24}")
            long expiracaoHoras,
            @Value("${simul.frontend.url}")
            String frontendUrl
    ) {
        this.tokenRepository =
                tokenRepository;

        this.usuarioRepository =
                usuarioRepository;

        this.usuarioValidation =
                usuarioValidation;

        this.emailNotificacaoStrategy =
                emailNotificacaoStrategy;

        this.expiracaoHoras =
                expiracaoHoras;

        this.frontendUrl =
                removerBarraFinal(
                        frontendUrl
                );

        this.secureRandom =
                new SecureRandom();
    }

    @Override
    @Transactional
    public void enviarVerificacao(
            Usuario usuario
    ) {
        if (
                usuarioValidation
                        .emailJaVerificado(
                                usuario
                        )
        ) {
            return;
        }

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

        TokenVerificacaoEmail entidade =
                new TokenVerificacaoEmail();

        entidade.setUsuario(
                usuario
        );

        entidade.setTokenHash(
                tokenHash
        );

        entidade.setDataExpiracao(
                LocalDateTime.now()
                        .plusHours(
                                expiracaoHoras
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
                        + "/verificar-email?token="
                        + token;

        String assunto =
                "Confirme seu e-mail no SIMUL";

        String mensagem =
                criarMensagemVerificacao(
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
    public VerificacaoEmailResponseDTO verificarEmail(
            String token
    ) {
        if (
                token == null ||
                token.isBlank()
        ) {
            return new VerificacaoEmailResponseDTO(
                    false,
                    "O token de verificação é inválido."
            );
        }

        String tokenHash =
                gerarHashToken(
                        token.trim()
                );

        Optional<TokenVerificacaoEmail> tokenOptional =
                tokenRepository
                        .findByTokenHashAndUtilizadoFalse(
                                tokenHash
                        );

        if (tokenOptional.isEmpty()) {
            return new VerificacaoEmailResponseDTO(
                    false,
                    "O link de verificação é inválido ou já foi utilizado."
            );
        }

        TokenVerificacaoEmail tokenVerificacao =
                tokenOptional.get();

        if (
                tokenVerificacao
                        .getDataExpiracao()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {
            return new VerificacaoEmailResponseDTO(
                    false,
                    "O link de verificação expirou. Solicite um novo e-mail de confirmação."
            );
        }

        Usuario usuario =
                tokenVerificacao
                        .getUsuario();

        if (
                usuarioValidation
                        .emailJaVerificado(
                                usuario
                        )
        ) {
            tokenVerificacao.setUtilizado(
                    true
            );

            tokenVerificacao.setDataUtilizacao(
                    LocalDateTime.now()
            );

            tokenRepository.save(
                    tokenVerificacao
            );

            return new VerificacaoEmailResponseDTO(
                    true,
                    "Este e-mail já está confirmado."
            );
        }

        usuario.setEmailVerificado(
                true
        );

        usuarioRepository.save(
                usuario
        );

        tokenVerificacao.setUtilizado(
                true
        );

        tokenVerificacao.setDataUtilizacao(
                LocalDateTime.now()
        );

        tokenRepository.save(
                tokenVerificacao
        );

        return new VerificacaoEmailResponseDTO(
                true,
                "E-mail confirmado com sucesso."
        );
    }

    @Override
    @Transactional
    public void reenviarVerificacao(
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

        if (usuarioOptional.isEmpty()) {
            return;
        }

        Usuario usuario =
                usuarioOptional.get();

        if (
                usuarioValidation
                        .emailJaVerificado(
                                usuario
                        )
        ) {
            return;
        }

        enviarVerificacao(
                usuario
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
                    "Não foi possível gerar o hash do token de verificação.",
                    exception
            );
        }
    }

    private String criarMensagemVerificacao(
            Usuario usuario,
            String link
    ) {
        return """
                Olá, %s.

                Você criou uma conta no SIMUL.

                Para confirmar que este endereço de e-mail pertence a você, acesse o link abaixo:

                %s

                Este link expira em %d hora(s).

                Se você não criou esta conta, ignore esta mensagem.

                SIMUL
                Sistema Integrado de Monitoramento Urbano de Limpeza
                """
                .formatted(
                        usuario.getNome(),
                        link,
                        expiracaoHoras
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