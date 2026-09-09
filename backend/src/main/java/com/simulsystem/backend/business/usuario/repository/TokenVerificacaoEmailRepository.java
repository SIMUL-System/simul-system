package com.simulsystem.backend.business.usuario.repository;

import com.simulsystem.backend.business.usuario.model.TokenVerificacaoEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenVerificacaoEmailRepository
        extends JpaRepository<TokenVerificacaoEmail, Long> {

    Optional<TokenVerificacaoEmail>
    findByTokenHashAndUtilizadoFalse(
            String tokenHash
    );

    void deleteByUsuarioId(
            Long usuarioId
    );
}