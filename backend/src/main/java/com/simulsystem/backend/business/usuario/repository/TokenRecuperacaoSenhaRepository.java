package com.simulsystem.backend.business.usuario.repository;

import com.simulsystem.backend.business.usuario.model.TokenRecuperacaoSenha;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Acesso aos tokens de recuperação de senha. */
public interface TokenRecuperacaoSenhaRepository
        extends JpaRepository<TokenRecuperacaoSenha, Long> {
    Optional<TokenRecuperacaoSenha>
    /** Token ainda não usado pelo hash. */
    findByTokenHashAndUtilizadoFalse(String tokenHash);

    /** Apaga os tokens anteriores do usuário. */
    void deleteByUsuarioId(Long usuarioId);
}
