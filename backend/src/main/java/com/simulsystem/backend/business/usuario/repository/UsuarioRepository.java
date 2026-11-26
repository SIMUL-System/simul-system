package com.simulsystem.backend.business.usuario.repository;

import com.simulsystem.backend.business.usuario.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Acesso aos usuários. */
public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {
    /** Usuário pelo índice do e-mail (CriptografiaDados.indiceEmail). */
    Optional<Usuario> findByEmailHash(String emailHash);

    /** E-mail já cadastrado? (pelo índice) */
    boolean existsByEmailHash(String emailHash);
}
