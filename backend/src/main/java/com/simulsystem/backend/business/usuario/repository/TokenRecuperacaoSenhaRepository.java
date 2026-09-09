package com.simulsystem.backend.business.usuario.repository;

import com.simulsystem.backend.business.usuario.model.TokenRecuperacaoSenha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRecuperacaoSenhaRepository
        extends JpaRepository<TokenRecuperacaoSenha, Long> {

    Optional<TokenRecuperacaoSenha>
    findByTokenHashAndUtilizadoFalse(
            String tokenHash
    );

    void deleteByUsuarioId(
            Long usuarioId
    );
}