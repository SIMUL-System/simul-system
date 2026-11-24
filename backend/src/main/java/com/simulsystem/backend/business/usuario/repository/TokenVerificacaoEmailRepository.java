package com.simulsystem.backend.business.usuario.repository;

import com.simulsystem.backend.business.usuario.model.TokenVerificacaoEmail;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Acesso aos tokens de confirmação de e-mail. */
public interface TokenVerificacaoEmailRepository extends JpaRepository<TokenVerificacaoEmail, Long> {

    /** Token pelo hash, usado ou não (o serviço decide o que fazer com um link já usado). */
    Optional<TokenVerificacaoEmail> findByTokenHash(String tokenHash);

    /** Apaga os tokens anteriores do usuário. */
    void deleteByUsuarioId(Long usuarioId);
}
